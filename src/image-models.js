import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {jellyIllustrationMaterial,softenGeometry,stylizeVertexColors} from './generated-material.js';

let endpoint=(import.meta.env.VITE_MODEL_API_URL||'').replace(/\/$/,'');
const devService=['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='5173';
let apiAvailable=!!endpoint||devService;
const serviceReady=(async()=>{if(apiAvailable)return;try{const response=await fetch(import.meta.env.BASE_URL+'model-service.json');if(!response.ok)return;const config=await response.json();const address=new URL(config.url);if(address.protocol==='https:'){endpoint=address.href.replace(/\/$/,'');apiAvailable=true;}}catch{}})();
const url=path=>endpoint+path;
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
const pause=(ms,signal)=>new Promise((resolve,reject)=>{const abort=()=>{clearTimeout(timer);reject(new DOMException('Aborted','AbortError'));};const timer=setTimeout(()=>{signal.removeEventListener('abort',abort);resolve();},ms);if(signal.aborted)abort();else signal.addEventListener('abort',abort,{once:true});});
let dbPromise;
function database(){return dbPromise??=new Promise((resolve,reject)=>{const req=indexedDB.open('jelly-studies',1);req.onupgradeneeded=()=>req.result.createObjectStore('models',{keyPath:'id'});req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function records(){const db=await database();return new Promise((resolve,reject)=>{const req=db.transaction('models').objectStore('models').getAll();req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function save(record){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('models','readwrite');tx.objectStore('models').put(record);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});}
async function removeRecord(id){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction('models','readwrite');tx.objectStore('models').delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);});}

function removableStudy(button,record,{art,onSelect}){
 const card=document.createElement('div');card.className='generated-card';
 const remove=document.createElement('button');remove.type='button';remove.className='remove-study';remove.textContent='×';remove.setAttribute('aria-label','删除'+(record.name||'新作品'));remove.title='删除';
 remove.onclick=async event=>{event.stopPropagation();remove.disabled=true;try{await removeRecord(record.id);if(button.getAttribute('aria-pressed')==='true')onSelect('berry');art.removeGenerated(record.id);card.remove();}catch(error){remove.disabled=false;remove.title='删除失败，请重试';console.warn('无法删除作品',error);}};
 card.append(button,remove);return card;
}

export function modelPalette(palette){
 const rgb=palette?.find(c=>Math.max(...c)>96&&Math.max(...c)-Math.min(...c)>32)||palette?.[0]||[150,180,150],color=new T.Color(`rgb(${rgb.join(',')})`),hsl={};color.getHSL(hsl);
 const cool=new T.Color().setHSL((hsl.h+.07)%1,Math.min(.25,hsl.s*.5),.73);
 const accent=new T.Color().setHSL((hsl.h+.94)%1,Math.min(.3,hsl.s*.55),.77);
 return {cool,accent};
}

function thumbnail(subject,palette){
 const scene=new T.Scene(),colors=modelPalette(palette),clone=subject.clone(true);clone.visible=true;clone.scale.set(1.06,.92,1.06);scene.add(clone);
 const tones=new T.DataTexture(new Uint8Array([155,155,155,255,196,196,196,255,228,228,228,255,250,250,250,255]),4,1);tones.needsUpdate=true;tones.minFilter=tones.magFilter=T.NearestFilter;
 const materials=[];clone.traverse(object=>{object.layers.set(0);if(!object.isMesh)return;const uniforms=object.material.uniforms;const material=new T.MeshToonMaterial({color:uniforms?.baseColor?.value?.clone()||new T.Color('#fff1db'),vertexColors:!!object.geometry.attributes.color,gradientMap:tones});object.material=material;materials.push(material);});
 scene.add(new T.HemisphereLight('#fff3dc','#a4a6ba',2));const light=new T.DirectionalLight('#fff1d7',2.2);light.position.set(-1,2,3);scene.add(light);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true});renderer.setClearColor(0,0);renderer.setSize(160,160);renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
 const camera=new T.OrthographicCamera(-.052,.052,.052,-.052,.001,1);camera.position.set(.10,.075,.14);camera.lookAt(0,.030,0);renderer.render(scene,camera);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const ctx=canvas.getContext('2d');const gradient=ctx.createRadialGradient(35,30,5,70,65,150);gradient.addColorStop(0,colors.cool.getStyle());gradient.addColorStop(1,colors.accent.getStyle());ctx.fillStyle=gradient;ctx.fillRect(0,0,160,160);ctx.fillStyle='rgba(146,136,163,.16)';ctx.beginPath();ctx.ellipse(83,128,43,8,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.90;ctx.drawImage(renderer.domElement,0,0);ctx.globalAlpha=1;
 const pixels=ctx.getImageData(0,0,160,160);for(let i=0;i<pixels.data.length;i+=4){let seed=i>>>2;seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=Math.imul(seed^(seed>>>16),0x45d9f3b);seed=((seed^(seed>>>16))>>>0)/4294967296;for(let c=0;c<3;c++){const value=pixels.data[i+c]/255;pixels.data[i+c]=(Math.floor(value*9+seed)/9*.80+value*.20)*255;}}ctx.putImageData(pixels,0,0);ctx.strokeStyle='#fff2d9';ctx.lineWidth=1.5;for(const [x,y]of [[22,31],[133,112]]){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
 for(const material of materials)material.dispose();tones.dispose();renderer.dispose();return canvas.toDataURL('image/png');
}

export async function prepareGeneratedModel(blob){
 const loaded=await new GLTFLoader().parseAsync(await blob.arrayBuffer(),'');loaded.scene.updateMatrixWorld(true);
 const sourceBounds=new T.Box3().setFromObject(loaded.scene),size=sourceBounds.getSize(new T.Vector3()),center=sourceBounds.getCenter(new T.Vector3());
 if(!Number.isFinite(size.length())||size.length()<1e-8)throw Error('模型没有有效几何形状。');
 const scale=.082/Math.max(size.x,size.y,size.z),root=new T.Group(),meshes=[];
 loaded.scene.traverse(source=>{if(!source.isMesh)return;const geometry=source.geometry.clone();geometry.applyMatrix4(source.matrixWorld);geometry.translate(-center.x,-sourceBounds.min.y,-center.z);geometry.scale(scale*1.08,scale*.91,scale*1.08);softenGeometry(geometry);stylizeVertexColors(geometry);geometry.computeVertexNormals();
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
 add.onclick=()=>{dialog.querySelector('.upload-error-mark').hidden=true;dialog.showModal();};dialog.addEventListener('close',()=>{if(!busy)controller?.abort();});
 input.onchange=()=>{file=input.files[0];if(!file)return;dialog.querySelector('.upload-error-mark').hidden=true;if(previewURL)URL.revokeObjectURL(previewURL);previewURL=URL.createObjectURL(file);preview.src=previewURL;preview.hidden=false;status.textContent='将自动压缩图片并提取主要主体';generate.disabled=false;};
 async function install(record){if((record.meshVersion||0)<2){await serviceReady;if(apiAvailable){try{const response=await fetch(url('/api/jobs/'+record.id.replace('model-','')),{signal:AbortSignal.timeout(8000)});if(response.ok){const job=await response.json();if(job.mesh_version>=2){const downloaded=await fetch(url(job.model_url),{signal:AbortSignal.timeout(15000)});if(downloaded.ok)record={...record,blob:await downloaded.blob(),meshVersion:job.mesh_version,thumbnailVersion:0};}}}catch{}}}const model=await prepareGeneratedModel(record.blob);const theme=art.addGenerated(record.id,model,record.palette);const thumb=record.thumbnailVersion===6?record.thumbnail:thumbnail(model.root,record.palette);const button=document.createElement('button');button.className='study generated-study';button.dataset.flavor=record.id;button.setAttribute('aria-label',record.name||'新作品');button.setAttribute('aria-pressed','false');const img=document.createElement('img');img.src=thumb;img.alt='';button.append(img);strip.insertBefore(removableStudy(button,record,{art,onSelect}),add);button.onclick=()=>onSelect(record.id);onAdded?.(theme);return {...record,thumbnail:thumb,thumbnailVersion:6};}
 generate.onclick=async()=>{if(!file||busy)return;await serviceReady;if(!apiAvailable){status.textContent='建模服务尚未连接，请稍后再试。';const mark=dialog.querySelector('.upload-error-mark');mark.hidden=false;mark.title=status.textContent;return;}dialog.querySelector('.upload-error-mark').hidden=true;busy=true;controller=new AbortController();const signal=controller.signal;generate.disabled=true;input.disabled=true;progress.hidden=false;status.textContent='正在连接建模服务…';
  try{status.textContent='正在压缩图片…';const compressed=await compressModelImage(file);const body=new FormData();body.append('image',compressed);const response=await fetch(url('/api/models'),{method:'POST',body,signal});const result=await response.json();if(!response.ok)throw Error(typeof result.detail==='string'?result.detail:'图片提交失败');let job=result;const started=Date.now();while(job.status!=='complete'){if(job.status==='failed')throw Error(job.error||'生成失败，请换张图片重试');if(Date.now()-started>20*60*1000)throw Error('生成超时，请稍后再试');status.textContent=job.stage;progress.value=job.progress;await pause(1600,signal);const poll=await fetch(url('/api/jobs/'+job.id),{signal});if(!poll.ok)throw Error('无法读取生成进度');job=await poll.json();}
   status.textContent='正在打开新作品…';const downloaded=await fetch(url(job.model_url),{signal});if(!downloaded.ok)throw Error('模型下载失败，请重试');const blob=await downloaded.blob();if(blob.size>50*1024*1024)throw Error('模型过大，暂时无法展示');const record=await install({id:'model-'+job.id,name:file.name.replace(/\.[^.]+$/,'').slice(0,40)||'新作品',palette:job.palette,meshVersion:job.mesh_version||2,blob,created:Date.now()});try{await save(record);}catch{status.textContent='作品已生成，浏览器存储空间不足，刷新后不会保留。';}onSelect(record.id);dialog.close();
  }catch(error){if(error.name!=='AbortError'){status.textContent=error.message.includes('fetch')?'连接失败，请确认建模服务在线后重试。':error.message;const mark=dialog.querySelector('.upload-error-mark');mark.hidden=false;mark.title=status.textContent;mark.setAttribute('aria-label',status.textContent);}}
  finally{busy=false;generate.disabled=!file;input.disabled=false;progress.hidden=true;}
 };
 const restored=records().then(async saved=>{for(const record of saved){try{const installed=await install(record);if(record.thumbnailVersion!==6)await save(installed);}catch(error){console.warn('无法恢复作品',record.id,error);}}}).catch(error=>console.warn('本地作品库不可用',error));
 return {restored};
}
