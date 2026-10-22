import {Idefics3Processor,Idefics3ForConditionalGeneration,RawImage,TextStreamer,env} from './vlm-runtime.js';
import {installModelFiles} from './local-model-files.js';
import {buildModelingPrompt,compileModelingPrompt} from './prompt-modeler.js';
import {foodKind} from './food-blueprint.js';

let lastProgress=0;
const progress=(stage,value)=>self.postMessage({type:'progress',stage,value:lastProgress=Math.max(lastProgress,value)});

async function generateText(model,processor,image,question,limit,from,to){
 const text=processor.apply_chat_template([{role:'user',content:[{type:'image'},{type:'text',text:question}]}],{add_generation_prompt:true});
 const inputs=await processor(text,[image],{do_image_splitting:false});let tokens=0;
 const streamer=new TextStreamer(processor.tokenizer,{skip_prompt:true,skip_special_tokens:true,callback_function:()=>{},token_callback_function:()=>{if(++tokens%8===0)progress('理解主体与部件…',Math.min(to-1,from+tokens/limit*(to-from)));}});
 let output;
 try{output=await model.generate({...inputs,max_new_tokens:limit,do_sample:false,repetition_penalty:1.08,streamer});return processor.tokenizer.batch_decode(output.slice(null,[inputs.input_ids.dims.at(-1),null]),{skip_special_tokens:true})[0].trim();}
 finally{output?.dispose?.();for(const value of Object.values(inputs))value?.dispose?.();}
}

let enginePromise=null,busy=false;
async function engineFor(data){
 if(!enginePromise)enginePromise=(async()=>{
  const base=new URL(data.assetsBase);
  env.allowRemoteModels=true;env.allowLocalModels=false;env.remoteHost=base.href;env.remotePathTemplate='{model}/';env.useBrowserCache=false;
  env.backends.onnx.wasm.wasmPaths={mjs:new URL('runtime/ort-wasm-simd-threaded.mjs',base).href,wasm:new URL('runtime/ort-wasm-simd-threaded.wasm',base).href};
  env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;
  await installModelFiles(base,bytes=>progress(`载入设备端模型 · ${Math.round(bytes/1048576)} MB`,Math.min(44,5+bytes/343162591*39)));
  env.fetch=self.fetch;
  const id='vision-500m-a7da5b9',processor=await Idefics3Processor.from_pretrained(id);
  const model=await Idefics3ForConditionalGeneration.from_pretrained(id,{device:'wasm',dtype:{embed_tokens:'q8',vision_encoder:'q4',decoder_model_merged:'q4'}});
  return {processor,model};
 })();
 return enginePromise;
}
self.onmessage=async({data})=>{
 if(data.type!=='analyze'||busy)return;busy=true;lastProgress=0;
 const start=performance.now(),reused=!!enginePromise;let engine;
 try{
  engine=await engineFor(data);const {model,processor}=engine,loaded=performance.now();
  if(data.debug)self.postMessage({type:'diagnostic',stage:'engine-ready',engineReused:reused,loadMs:Math.round(loaded-start)});
  progress('分析主体…',45);
  const image=await RawImage.fromBlob(data.file);
  const subject=await generateText(model,processor,image,'What is the main object in this image? Answer with only its name.',20,46,56);
  let kind=foodKind(subject);const subjectDone=performance.now();
  const isCake=kind==='cake'||kind==='cake-slice',isDrink=kind==='coffee-cup',isDessert=kind==='dessert-cup';
  let description=await generateText(model,processor,image,isCake?'Is this a whole cake or a slice of cake?':isDrink?'Describe the cup in one sentence.':isDessert?'Describe the dessert in one sentence.':'Describe the main object, its visible parts and colors in two sentences. Ignore the background.',isCake?25:isDrink||isDessert?55:90,56,72);
  kind=foodKind(subject,description);let observations=null;
  if(kind==='cake'||kind==='cake-slice'){
   const crop=data.crops?.toppings?await RawImage.fromBlob(data.crops.toppings):image;
   const toppings=await generateText(model,processor,crop,'What fruits and decorations are visible? Describe their colors and positions.',65,72,88);
   description+=' '+toppings;
   if(data.cakeAnalysis?.reliable&&data.cakeAnalysis?.frosting?.color&&!/piped|whipped|swirl|rosette/.test(description))description+=' '+await generateText(model,processor,crop,'Describe the cream around the fruits.',35,88,92);
   const cutText=data.cakeAnalysis?.reliable?null:await generateText(model,processor,image,'How many sponge cake layers are visible? Count only sponge, not cream.',20,88,92);
   if(cutText)description+=' '+cutText;
   observations={...data.cakeAnalysis,toppingsDescription:toppings};
  }else if(kind){
   const detail=await generateText(model,processor,image,kind==='coffee-cup'?'Describe what is inside the cup.':'Describe the dessert layers.',55,72,92);description+=' '+detail;
  }
  if(subject.length<2||description.length<12)throw Error('没有看清照片中的主体，请换一张主体清楚的图片。');
  progress('根据部件位置与层次构造…',94);
  if(data.debug)self.postMessage({type:'diagnostic',subject,description,observations});
  let recipe;
  try{recipe=compileModelingPrompt(buildModelingPrompt(subject,description,data.palette,observations));}
  catch(error){throw Error(error.message+'（识别名称：'+subject.slice(0,100)+'）');}
  recipe.timings={engineReused:reused,loadMs:Math.round(loaded-start),subjectMs:Math.round(subjectDone-loaded),totalMs:Math.round(performance.now()-start)};
  self.postMessage({type:'complete',recipe});
 }catch(error){enginePromise=null;await engine?.model.dispose();self.postMessage({type:'error',message:error.message||'设备端建模失败，请重试。'});}
 finally{busy=false;}
};
