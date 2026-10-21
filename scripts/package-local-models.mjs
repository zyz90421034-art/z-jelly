import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const cache=process.argv[2];if(!cache)throw Error('Pass the directory containing the downloaded model folders.');
const root=path.resolve('public/local-models');fs.mkdirSync(root,{recursive:true});
const definitions=[
 {source:'smolvlm-500m',id:'vision-500m-a7da5b9',repo:'HuggingFaceTB/SmolVLM-500M-Instruct',revision:'a7da5b986cb59b408707209984f360a5f4ad7e47'},
];
const manifest={version:1,files:{},models:definitions.map(({source,...x})=>x)};
for(const model of definitions){
 const folder=path.join(cache,model.source);
 for(const dir of ['', 'onnx'])for(const name of fs.readdirSync(path.join(folder,dir))){
  const input=path.join(folder,dir,name);if(!fs.statSync(input).isFile()||name.endsWith('.part')||name.includes('.range-')||name.includes('.clean_'))continue;
  const key=[model.id,dir,name].filter(Boolean).join('/'),data=fs.readFileSync(input),output=path.join(root,key);fs.mkdirSync(path.dirname(output),{recursive:true});
  if(name.endsWith('.onnx')){
   const chunks=[];for(let offset=0;offset<data.length;offset+=8*1024*1024){const bytes=data.subarray(offset,offset+8*1024*1024),relative=key+`.part-${String(chunks.length).padStart(3,'0')}`;fs.writeFileSync(path.join(root,relative),bytes);chunks.push({path:relative,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});}
   manifest.files[key]={bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex'),chunks};
  }else fs.writeFileSync(output,data);
 }
}
fs.writeFileSync(path.join(root,'manifest.json'),JSON.stringify(manifest,null,2));
const runtime=path.join(root,'runtime');fs.mkdirSync(runtime,{recursive:true});
for(const file of ['ort-wasm-simd-threaded.mjs','ort-wasm-simd-threaded.wasm'])fs.copyFileSync(path.join('node_modules/onnxruntime-web/dist',file),path.join(runtime,file));
console.log('Packaged model bytes',Object.values(manifest.files).reduce((s,v)=>s+v.bytes,0));
