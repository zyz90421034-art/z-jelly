import {analyzeColors} from './image-color-analysis.js';
import {analyzeDrinkPixels} from './drink-image-analysis.js';
import {analyzeCakePixels} from './cake-image-analysis.js';

let warmWorker=null,warmTimer=null;
addEventListener('pagehide',()=>{warmWorker?.terminate();warmWorker=null;clearTimeout(warmTimer);});

// Only model files are fetched. Inference and the uploaded photo stay on the device.
export async function analyzeObject(file,onProgress=()=>{},signal){
 signal?.throwIfAborted();
 const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');
 const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));
 const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),{palette}=analyzeColors(pixels.data,canvas.width,canvas.height);
 const drinkAnalysis=analyzeDrinkPixels(pixels.data,canvas.width,canvas.height);
 const cakeAnalysis=analyzeCakePixels(pixels.data,canvas.width,canvas.height),crops={};
 if(cakeAnalysis.reliable)for(const [name,bounds]of Object.entries(cakeAnalysis.crops)){
  const [x,y,w,h]=bounds,part=document.createElement('canvas');part.width=Math.max(1,Math.round(Math.min(w,canvas.width-x)));part.height=Math.max(1,Math.round(Math.min(h,canvas.height-y)));
  part.getContext('2d').drawImage(canvas,x,y,part.width,part.height,0,0,part.width,part.height);crops[name]=await new Promise(resolve=>part.toBlob(resolve,'image/png'));
 }
 return new Promise((resolve,reject)=>{
  clearTimeout(warmTimer);
  const worker=warmWorker||new Worker(new URL('./local-vlm.worker.js',import.meta.url),{type:'module'});warmWorker=worker;
  const stop=(dispose=false)=>{if(dispose){worker.terminate();if(warmWorker===worker)warmWorker=null;}worker.onmessage=null;worker.onerror=null;signal?.removeEventListener('abort',abort);};
  const abort=()=>{stop(true);reject(new DOMException('已取消','AbortError'));};
  signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)return abort();
  worker.onmessage=({data})=>{
   if(data.type==='progress')onProgress(data.stage,data.value);
   else if(data.type==='diagnostic')console.info('Local modeling diagnostic',JSON.stringify(data));
   else if(data.type==='complete'){stop();warmTimer=setTimeout(()=>{worker.terminate();if(warmWorker===worker)warmWorker=null;},90000);if(location.hostname==='127.0.0.1')console.info('Local VLM modeling plan',JSON.stringify(data.recipe));resolve(data.recipe);}
   else if(data.type==='error'){stop(true);reject(Error(data.message));}
  };
  worker.onerror=event=>{stop(true);reject(Error(event.message||'浏览器无法启动设备端建模。'));};
  worker.postMessage({type:'analyze',file,palette,cakeAnalysis,drinkAnalysis,crops,debug:location.hostname==='127.0.0.1',assetsBase:new URL(import.meta.env.BASE_URL+'local-models/',document.baseURI).href});
 });
}
