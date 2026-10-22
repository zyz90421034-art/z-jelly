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

self.onmessage=async({data})=>{
 if(data.type!=='analyze')return;let model;
 try{
  const base=new URL(data.assetsBase);
  // "Remote" means static HTTP files here. Restrict that host to this site's own model directory.
  env.allowRemoteModels=true;env.allowLocalModels=false;env.remoteHost=base.href;env.remotePathTemplate='{model}/';env.useBrowserCache=false;
  env.backends.onnx.wasm.wasmPaths={mjs:new URL('runtime/ort-wasm-simd-threaded.mjs',base).href,wasm:new URL('runtime/ort-wasm-simd-threaded.wasm',base).href};
  env.backends.onnx.wasm.numThreads=1;env.backends.onnx.wasm.proxy=false;
  await installModelFiles(base,bytes=>progress(`载入设备端模型 · ${Math.round(bytes/1048576)} MB`,Math.min(44,5+bytes/343162591*39)));
  env.fetch=self.fetch;
  const id='vision-500m-a7da5b9',processor=await Idefics3Processor.from_pretrained(id);
  model=await Idefics3ForConditionalGeneration.from_pretrained(id,{device:'wasm',dtype:{embed_tokens:'q8',vision_encoder:'q4',decoder_model_merged:'q4'}});
  const image=await RawImage.fromBlob(data.file);
  const subject=await generateText(model,processor,image,'What is the main object in this image? Answer with only its name.',20,46,56);
  let kind=foodKind(subject);
  const isCake=kind==='cake'||kind==='cake-slice',isDrink=kind==='coffee-cup',isDessert=kind==='dessert-cup';
  // The 500M VLM gives better evidence to short, concrete questions than a long checklist.
  let description=await generateText(model,processor,image,isDrink?'Describe the cup and what is inside it.':isCake||isDessert?'Describe this image.':'Describe the main object, its visible parts, colors and pose in two sentences. Ignore the background.',isCake||isDessert?150:120,56,80);
  const resolvedKind=foodKind(subject,description);
  if(!kind&&resolvedKind){description+=' '+await generateText(model,processor,image,resolvedKind==='coffee-cup'?'Describe the cup and what is inside it.':'Describe this image.',100,80,88);}
  kind=resolvedKind;
  if(kind){
   const detail=await generateText(model,processor,image,kind==='cake'||kind==='cake-slice'?'How many cake layers are visible?':kind==='coffee-cup'?'Does the cup have a handle?':'Describe the dessert layers.',kind==='dessert-cup'?80:25,88,92);
   description+=' '+detail;
  }
  if(subject.length<2||description.length<12)throw Error('没有看清照片中的主体，请换一张主体清楚的图片。');
  progress('编写建模提示词与组合部件…',94);
  if(data.debug)self.postMessage({type:'diagnostic',subject,description});
  let recipe;
  try{recipe=compileModelingPrompt(buildModelingPrompt(subject,description,data.palette));}
  catch(error){throw Error(error.message+'（识别名称：'+subject.slice(0,100)+'）');}
  await model.dispose();model=null;
  self.postMessage({type:'complete',recipe});
 }catch(error){self.postMessage({type:'error',message:error.message||'设备端建模失败，请重试。'});}
 finally{await model?.dispose();}
};
