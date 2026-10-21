// GitHub stores small binary shards; the runtime sees their original ONNX file.
export async function installModelFiles(base,onProgress){
 const nativeFetch=self.fetch.bind(self),response=await nativeFetch(new URL('manifest.json',base));
 if(!response.ok)throw Error('本地模型清单加载失败，请检查网络。');
 const manifest=await response.json();
 let cache;try{cache=await caches.open('jelly-local-models-v1');}catch{}
 const complete=new Map();
 self.fetch=async(input,options)=>{
  const url=new URL(typeof input==='string'?input:input instanceof URL?input.href:input.url,self.location.href);
  const key=url.href.startsWith(base.href)?decodeURIComponent(url.href.slice(base.href.length)):null;
  const file=manifest.files[key];if(!file)return nativeFetch(input,options);
  const range=new Headers(options?.headers||(input instanceof Request?input.headers:undefined)).get('Range');
  if(range==='bytes=0-0')return new Response(new Uint8Array([0]),{status:206,headers:{'Content-Type':'application/octet-stream','Content-Length':'1','Content-Range':`bytes 0-0/${file.bytes}`}});
  return new Response(new ReadableStream({async start(controller){
   try{
    for(const part of file.chunks){
     const partURL=new URL(part.path,base).href;let stored=await cache?.match(partURL),bytes;
     if(stored)bytes=await stored.arrayBuffer();
     else{const r=await nativeFetch(partURL);if(!r.ok)throw Error('模型分片下载失败，请检查网络后重试。');bytes=await r.arrayBuffer();}
     if(bytes.byteLength!==part.bytes)throw Error('模型分片大小错误，请重试。');
     const digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
     if(digest!==part.sha256){await cache?.delete(partURL);throw Error('模型分片校验失败，请重试。');}
     if(!stored&&cache)try{await cache.put(partURL,new Response(bytes));}catch{}
     complete.set(partURL,part.bytes);onProgress([...complete.values()].reduce((a,b)=>a+b,0));
     controller.enqueue(new Uint8Array(bytes));
    }
    controller.close();
   }catch(error){controller.error(error);}
  }}),{headers:{'Content-Type':'application/octet-stream','Content-Length':String(file.bytes)}});
 };
 return manifest;
}
