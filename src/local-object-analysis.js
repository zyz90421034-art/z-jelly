import {analyzeColors} from './image-color-analysis.js';

// Only model files are fetched. Inference and the uploaded photo stay on the device.
export async function analyzeObject(file,onProgress=()=>{},signal){
 signal?.throwIfAborted();
 const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');
 const scale=Math.min(1,320/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),{palette}=analyzeColors(pixels.data,canvas.width,canvas.height);
 return new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./local-vlm.worker.js',import.meta.url),{type:'module'});
  const stop=()=>{worker.terminate();signal?.removeEventListener('abort',abort);};
  const abort=()=>{stop();reject(new DOMException('已取消','AbortError'));};
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)return abort();
  worker.onmessage=({data})=>{
   if(data.type==='progress')onProgress(data.stage,data.value);
   else if(data.type==='diagnostic')console.info('Local modeling diagnostic',JSON.stringify(data));
   else if(data.type==='complete'){stop();if(location.hostname==='127.0.0.1')console.info('Local VLM modeling plan',JSON.stringify(data.recipe));resolve(data.recipe);}
   else if(data.type==='error'){stop();reject(Error(data.message));}
  };
  worker.onerror=event=>{stop();reject(Error(event.message||'浏览器无法启动设备端建模。'));};
  worker.postMessage({type:'analyze',file,palette,debug:location.hostname==='127.0.0.1',assetsBase:new URL(import.meta.env.BASE_URL+'local-models/',document.baseURI).href});
 });
}
