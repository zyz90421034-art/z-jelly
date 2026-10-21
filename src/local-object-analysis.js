import * as tf from '@tensorflow/tfjs';
import {analyzeColors} from './image-color-analysis.js';
import {BlazeFaceModel} from '@tensorflow-models/blazeface';
import {chooseObject,objectRecipe} from './semantic-recipes.js';

const base=import.meta.env.BASE_URL+'local-vision/';
let engines;
async function onDevice(operation){
 try{return await operation();}catch(error){if(tf.getBackend()!=='webgl')throw error;await tf.setBackend('cpu');await tf.ready();return operation();}
}
async function loadEngines(){
 if(!engines)engines=(async()=>{
  try{if(!await tf.setBackend('webgl'))await tf.setBackend('cpu');}catch{await tf.setBackend('cpu');}await tf.ready();
  const [classifier,faceGraph,labels]=await Promise.all([tf.loadLayersModel(base+'model.json'),tf.loadGraphModel(base+'face/model.json'),fetch(base+'labels.json').then(r=>{if(!r.ok)throw Error('识别资源加载失败，请检查网络后重试。');return r.json();})]);
  // The converted MediaPipe model has separate score/box heads; BlazeFace expects joined heads.
  const faceModel={predict(input){return tf.tidy(()=>{const outputs=faceGraph.predict(input);if(!Array.isArray(outputs))return outputs;const scores=outputs.filter(t=>t.shape[2]===1).sort((a,b)=>b.shape[1]-a.shape[1]),boxes=outputs.filter(t=>t.shape[2]===16).sort((a,b)=>b.shape[1]-a.shape[1]);return tf.concat([tf.concat(scores,1),tf.concat(boxes,1)],2);});},dispose(){faceGraph.dispose();}};
  return {classifier,detector:new BlazeFaceModel(faceModel,128,128,1,.3,.90),labels};
 })().catch(error=>{engines=null;throw error;});
 return engines;
}

function sampleRegion(ctx,x,y,w,h){const width=ctx.canvas.width,height=ctx.canvas.height;const region=ctx.getImageData(Math.max(0,Math.min(width-1,Math.floor(x))),Math.max(0,Math.min(height-1,Math.floor(y))),Math.max(1,Math.min(width-Math.max(0,Math.floor(x)),Math.ceil(w))),Math.max(1,Math.min(height-Math.max(0,Math.floor(y)),Math.ceil(h)))).data;const rgb=[0,0,0];let count=0;for(let i=0;i<region.length;i+=4)if(region[i+3]>160){for(let j=0;j<3;j++)rgb[j]+=region[i+j];count++;}return count?rgb.map(v=>Math.round(v/count)):[219,174,146];}

export async function analyzeObject(file,onProgress=()=>{}){
 onProgress('读取图片',10);const bitmap=await createImageBitmap(file);
 const canvas=document.createElement('canvas'),scale=Math.min(1,320/Math.max(bitmap.width,bitmap.height));canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);bitmap.close();
 const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);const analysis=analyzeColors(pixels.data,canvas.width,canvas.height);
 onProgress('载入设备端识别',24);const {classifier,detector,labels}=await loadEngines();await tf.nextFrame();
 const crop=document.createElement('canvas');crop.width=crop.height=224;const c=crop.getContext('2d'),[x,y,w,h]=analysis.bounds;c.fillStyle='#eee9df';c.fillRect(0,0,224,224);c.drawImage(canvas,x,y,w,h,0,0,224,224);
 onProgress('识别物体与结构',48);
 const scores=await onDevice(async()=>{const output=tf.tidy(()=>classifier.predict(tf.browser.fromPixels(crop).toFloat().div(127.5).sub(1).expandDims(0)));try{return await output.data();}finally{output.dispose();}});
 const predictions=Array.from(scores,(probability,index)=>({className:labels[index]||'',probability})).sort((a,b)=>b.probability-a.probability).slice(0,8);
 await tf.nextFrame();let face=null;
 const faces=await onDevice(()=>detector.estimateFaces(canvas,false,false,false));
 if(faces.length){const f=faces[0],[left,top]=f.topLeft,[right,bottom]=f.bottomRight,fw=right-left,fh=bottom-top;face={probability:Number(f.probability[0]),area:fw*fh/(canvas.width*canvas.height)};analysis.skin=sampleRegion(ctx,left+fw*.25,top+fh*.3,fw*.5,fh*.45);analysis.hair=sampleRegion(ctx,left,top-fh*.12,fw,fh*.23);analysis.shirt=sampleRegion(ctx,left,top+fh*1.3,fw,Math.min(fh*.8,canvas.height-top-fh*1.3));}
 const semantic=chooseObject(predictions,face);onProgress('组合卡通几何体',80);await tf.nextFrame();
 return objectRecipe(semantic,analysis);
}
