import * as T from 'three';
import {studyThumbnail as thumbnail} from './study-thumbnail.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {jellyIllustrationMaterial,softenGeometry,stylizeVertexColors} from './generated-material.js';
import {primitiveStudy} from './semantic-recipes.js';

export async function compressModelImage(file){
 let image;
 try{image=await createImageBitmap(file);}catch{throw Error('浏览器无法解码这张图片，请重新导出为 PNG 或 JPEG 后重试。');}
 try{
  const scale=Math.min(1,1600/Math.max(image.width,image.height));
  const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
  const context=canvas.getContext('2d');context.imageSmoothingEnabled=true;context.imageSmoothingQuality='high';context.drawImage(image,0,0,canvas.width,canvas.height);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
  if(!blob)throw Error('图片压缩失败，请重新选择图片。');
  return new File([blob],file.name.replace(/\.[^.]*$/,'')+'.png',{type:'image/png'});
 }finally{image.close();}
}
function removableStudy(button,record,{art,onSelect}){
 const card=document.createElement('div');card.className='generated-card';
 const remove=document.createElement('button');remove.type='button';remove.className='remove-study';remove.textContent='×';remove.setAttribute('aria-label','删除'+(record.name||'新作品'));remove.title='删除';
 remove.onclick=event=>{event.stopPropagation();if(button.getAttribute('aria-pressed')==='true')onSelect('berry');art.removeGenerated(record.id);card.remove();};
 card.append(button,remove);return card;
}

export async function prepareGeneratedModel(blob,palette){
 const loaded=await new GLTFLoader().parseAsync(await blob.arrayBuffer(),'');loaded.scene.updateMatrixWorld(true);
 const sourceBounds=new T.Box3().setFromObject(loaded.scene),size=sourceBounds.getSize(new T.Vector3()),center=sourceBounds.getCenter(new T.Vector3());
 if(!Number.isFinite(size.length())||size.length()<1e-8)throw Error('模型没有有效几何形状。');
 const scale=.082/Math.max(size.x,size.y,size.z),root=new T.Group(),meshes=[];
 loaded.scene.traverse(source=>{if(!source.isMesh)return;const geometry=source.geometry.clone();geometry.applyMatrix4(source.matrixWorld);geometry.translate(-center.x,-sourceBounds.min.y,-center.z);geometry.scale(scale*1.08,scale*.91,scale*1.08);softenGeometry(geometry);stylizeVertexColors(geometry,palette);geometry.computeVertexNormals();
  const original=Array.isArray(source.material)?source.material[0]:source.material;
  const material=jellyIllustrationMaterial(original,geometry);
  const mesh=new T.Mesh(geometry,material);mesh.frustumCulled=false;mesh.layers.set(1);root.add(mesh);meshes.push(mesh);
 });
 if(!meshes.length)throw Error('生成结果不包含可展示的网格。');
 const bounds=new T.Box3().setFromObject(root),dimensions=bounds.getSize(new T.Vector3());
 return {root,meshes,height:dimensions.y,radius:Math.max(dimensions.x,dimensions.z)/2};
}

export function createImageLibrary({art,onSelect,onAdded}){
 const strip=document.querySelector('.flavors'),add=document.createElement('button');add.className='study add-study';add.setAttribute('aria-label','添加图片生成模型');add.innerHTML='<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M7 8Q40 3 73 8L74 72Q40 77 6 72Z" fill="#d9d8cc"/><path d="M24 40H56M40 24V56" stroke="#8c9c91" stroke-width="3.5" stroke-linecap="round"/></svg>';strip.append(add);
 const dialog=document.createElement('dialog');dialog.className='upload-dialog';dialog.innerHTML=`<form method="dialog"><button class="close-upload" aria-label="关闭">×</button></form><label class="image-drop" aria-label="选择图片"><input type="file" accept="image/png,image/jpeg,image/webp" aria-label="选择图片"/><span aria-hidden="true"><svg viewBox="0 0 80 80"><path d="M40 18V62M18 40H62" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg></span><img alt="待建模的图片" hidden/></label><p class="upload-status" role="status" aria-live="polite"></p><progress max="100" value="0" hidden aria-label="建模进度"></progress><button class="generate-study" type="button" disabled aria-label="生成模型"><svg viewBox="0 0 56 56" aria-hidden="true"><path d="M14 40L35 19M29 18L37 26M39 8L41 14L47 16L41 18L39 24L37 18L31 16L37 14ZM17 11L18 15L22 16L18 17L17 21L16 17L12 16L16 15Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button><span class="upload-error-mark" hidden role="img" aria-label="生成失败">!</span>`;document.body.append(dialog);
 const input=dialog.querySelector('[type=file]'),preview=dialog.querySelector('img'),status=dialog.querySelector('.upload-status'),generate=dialog.querySelector('.generate-study'),progress=dialog.querySelector('progress');let file,previewURL,controller,busy=false;
 add.onclick=()=>{dialog.querySelector('.upload-error-mark').hidden=true;dialog.showModal();};dialog.addEventListener('close',()=>controller?.abort());
 input.onchange=()=>{file=input.files[0];if(!file)return;dialog.querySelector('.upload-error-mark').hidden=true;if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(file);preview.src=previewURL;preview.hidden=false;status.textContent='首次需载入约 350 MB 本地模型，建议使用 Wi-Fi';generate.disabled=false;};
 async function install(record){
  const model=record.recipe?primitiveStudy(record.recipe):await prepareGeneratedModel(record.blob,record.palette);
  const theme=art.addGenerated(record.id,model,record.palette),thumb=record.thumbnailVersion===10?record.thumbnail:thumbnail(model.root,record.palette);
  const button=document.createElement('button');button.className='study generated-study';button.dataset.flavor=record.id;button.setAttribute('aria-label',record.name||'新作品');button.setAttribute('aria-pressed','false');
  const img=document.createElement('img');img.src=thumb;img.alt='';button.append(img);strip.insertBefore(removableStudy(button,record,{art,onSelect}),add);button.onclick=()=>onSelect(record.id);onAdded?.(theme);
  return {...record,thumbnail:thumb,thumbnailVersion:10};
 }
 generate.onclick=async()=>{
  if(!file||busy)return;busy=true;controller=new AbortController();const signal=controller.signal;generate.disabled=true;input.disabled=true;progress.hidden=false;progress.value=0;dialog.querySelector('.upload-error-mark').hidden=true;
  try{
   status.textContent='正在压缩图片…';const compressed=await compressModelImage(file);signal.throwIfAborted();
   const {analyzeObject}=await import('./local-object-analysis.js');signal.throwIfAborted();
   const recipe=await analyzeObject(compressed,(stage,value)=>{status.textContent=stage;progress.value=value;},signal);signal.throwIfAborted();
   const record=await install({id:'study-'+crypto.randomUUID(),name:file.name.replace(/\.[^.]+$/,'').slice(0,40)||'新作品',recipe,palette:recipe.palette,created:Date.now()});
   onSelect(record.id);dialog.close();
  }catch(error){if(error.name!=='AbortError'){status.textContent=error.message.includes('fetch')?'设备端识别资源加载失败，请检查网络后重试。':error.message;const mark=dialog.querySelector('.upload-error-mark');mark.hidden=false;mark.title=status.textContent;mark.setAttribute('aria-label',status.textContent);}}
  finally{busy=false;generate.disabled=!file;input.disabled=false;progress.hidden=true;}
 };
}
