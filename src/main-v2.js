import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {createArtwork,createPaintingPipeline,fillY} from './art-v2.js';
import {CupInteraction} from './interaction.js';
import {JellyVolume} from './physics-v2.js';
import './style.css';

const canvas=document.querySelector('#scene'),notice=document.querySelector('#notice');
const v=new T.Vector3(),a=new T.Vector3(),b=new T.Vector3(),q=new T.Quaternion();
let art,renderer,camera,controls,pipeline,interaction,volume,frame=0,previous=performance.now(),disposed=false,activeFill=fillY,lastScale=1;
let currentFlavor='berry';
const loader=document.createElement('div');loader.className='loading-mark';loader.setAttribute('aria-label','正在载入');loader.innerHTML='<span></span>';document.querySelector('.paper').append(loader);
function setFlavor(flavor){if(currentFlavor===flavor)return;currentFlavor=flavor;if(art){art.setFlavor(flavor);configureTheme();}for(const button of document.querySelectorAll('[data-flavor]')){const active=button.dataset.flavor===flavor;button.setAttribute('aria-pressed',String(active));button.classList.toggle('active',active);}}
function studyThumbnail(flavor){
 const green=flavor==='matcha',id='study-'+flavor;
 const cup=green?'M23 25Q40 18 57 25L53 60Q40 70 27 60Z':'M14 32Q40 23 66 32L60 59Q40 72 20 59Z';
 const rim=green?'M23 25Q40 16 57 25Q40 34 23 25Z':'M14 32Q40 20 66 32Q40 43 14 32Z';
 const fruit=green?`<ellipse fill="#94ad57" cx="35" cy="32" rx="10" ry="7" transform="rotate(-18 35 32)"/><ellipse fill="#deeaab" cx="35" cy="32" rx="7" ry="4.8" transform="rotate(-18 35 32)"/><path d="M31 30l1 2m3-4v2m4 0l-1 2m0 3l-2-1m-4 2l1-2" stroke="#7c8c4c" stroke-width="1.1"/><path fill="#eab277" d="M45 29Q56 25 53 39Q47 43 42 37Z"/><path fill="#adc479" d="M39 43Q47 38 51 43L48 54Q41 58 37 51Z"/>`:`<path fill="#b84c70" d="M22 39Q20 30 29 31Q37 28 38 38Q39 47 30 48Q22 48 22 39Z"/><path fill="#d4768d" d="M27 33Q24 33 24 38" stroke="#e99eaa" stroke-width="2" stroke-linecap="round"/><path fill="#edb076" d="M40 34Q58 30 57 43Q54 51 43 47Q37 42 40 34Z"/><path fill="#cc6482" d="M42 49Q48 43 54 49Q61 57 53 60Q43 62 42 49Z"/>`;
 return `<svg viewBox="0 0 80 80" aria-hidden="true"><defs><radialGradient id="${id}-paper" cx="30%" cy="30%" r="90%"><stop stop-color="${green?'#b6d7c2':'#b9d9dd'}"/><stop offset=".5" stop-color="${green?'#b5cfb5':'#a9c8d6'}"/><stop offset="1" stop-color="${green?'#d7d6a9':'#c3b0cf'}"/></radialGradient><linearGradient id="${id}-jelly" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${green?'#dce8ad':'#dfb5d8'}" stop-opacity=".65"/><stop offset="1" stop-color="${green?'#aabd7b':'#b991c8'}" stop-opacity=".9"/></linearGradient><filter id="${id}-edge" x="-12%" y="-12%" width="124%" height="124%"><feTurbulence type="fractalNoise" baseFrequency=".095" numOctaves="2" seed="7" result="rough"/><feDisplacementMap in="SourceGraphic" in2="rough" scale=".65" xChannelSelector="R" yChannelSelector="G"/></filter><filter id="${id}-grain"><feTurbulence type="fractalNoise" baseFrequency=".72" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><clipPath id="${id}-clip"><path d="M6 7Q38 3 73 7L74 73Q39 77 6 73Z"/></clipPath></defs><g clip-path="url(#${id}-clip)"><path fill="url(#${id}-paper)" d="M0 0H80V80H0Z"/><ellipse cx="43" cy="65" rx="22" ry="5" fill="${green?'#91ad9b':'#9b91b6'}" opacity=".22"/><g filter="url(#${id}-edge)" stroke-linejoin="round"><path d="${cup}" fill="url(#${id}-jelly)"/><path fill="${green?'#f2e8c3':'#f4d6c1'}" d="${green?'M26 50Q40 57 54 50L53 60Q40 70 27 60Z':'M18 50Q40 62 62 50L60 59Q40 72 20 59Z'}"/><path d="${rim}" fill="${green?'#d3dfb4':'#d4badb'}" opacity=".55"/>${fruit}<path d="${cup}" fill="none" stroke="#f8eee6" stroke-width="1.8" opacity=".85"/><path d="${rim}" fill="none" stroke="#fff0ed" stroke-width="1.7" opacity=".8"/><path d="${green?'M26 32L29 53':'M18 39L23 54'}" fill="none" stroke="#fff6ed" stroke-width="2.3" stroke-linecap="round" opacity=".55"/></g><path d="M13 15v6m-3-3h6M65 53v5m-2.5-2.5h5" stroke="#fff1d6" stroke-width="1" opacity=".8"/><path d="M0 0H80V80H0Z" filter="url(#${id}-grain)" opacity=".10" style="mix-blend-mode:soft-light"/></g></svg>`;
}
const studies=[['berry','Cherry'],['matcha','Kiwi']];
for(const [flavor,label]of studies){const button=document.createElement('button');button.className='study'+(flavor===currentFlavor?' active':'');button.dataset.flavor=flavor;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(flavor===currentFlavor));button.innerHTML=studyThumbnail(flavor);button.addEventListener('click',()=>setFlavor(flavor));document.querySelector('.flavors').append(button);}

function prepareMesh(mesh){mesh.userData.base??=new Float32Array(mesh.geometry.attributes.position.array);mesh.geometry.attributes.position.setUsage(T.DynamicDrawUsage);}
function configureTheme(){
 activeFill=art.fillY;volume=new JellyVolume({resolution:10,radius:art.radius,height:activeFill-art.bottom,bottom:art.bottom,frequency:3.4,damping:.12,adhesion:1,response:.35,maxDisplacement:.009});
 prepareMesh(art.jelly);prepareMesh(art.cream);interaction?.dispose();art.cup.position.set(0,0,0);art.cup.quaternion.identity();interaction=new CupInteraction({canvas,camera,cup:art.cup,hitObject:art.root,controls,maxOffset:.03,baseRadius:art.extras.baseRadius});
 const target=new T.Vector3(0,art.extras.height*.52,0),scale=currentFlavor==='matcha'?1.18:1;camera.position.sub(controls.target).multiplyScalar(scale/lastScale).add(target);controls.target.copy(target);lastScale=scale;controls.update();
}
function warpMesh(mesh){
 const position=mesh.geometry.attributes.position,base=mesh.userData.base;
 for(let i=0;i<position.count;i++){
  const x=base[i*3],y=base[i*3+1],z=base[i*3+2];volume.sample(x,y,z,v);
  const radius=Math.hypot(x,z),wall=T.MathUtils.smoothstep((art.radius-radius)/.008,0,1),top=T.MathUtils.smoothstep(y,activeFill-.004,activeFill);
  const grip=.12+.88*wall;
  position.setXYZ(i,x+v.x*grip,y+v.y*grip*(1+.25*top),z+v.z*grip);
 }
 position.needsUpdate=true;mesh.geometry.computeVertexNormals();
}
function moveFruits(dt){
 const steps=Math.max(1,Math.ceil(Math.min(dt,.05)/.004)),h=Math.min(dt,.05)/steps,lag=.035,w=1/lag;
 for(const fruit of art.fruits){
  const {rest,quaternion,velocity,lag:offset}=fruit.userData;
  volume.sample(rest.x,rest.y,rest.z,v);
  for(let step=0;step<steps;step++){velocity.addScaledVector(a.copy(v).sub(offset).multiplyScalar(w*w).addScaledVector(velocity,-1.2*w),h);offset.addScaledVector(velocity,h);}
  if(v.lengthSq()<1e-12&&offset.lengthSq()<1e-12&&velocity.lengthSq()<1e-10){offset.set(0,0,0);velocity.set(0,0,0);}
  fruit.position.copy(rest).add(offset);
  volume.sample(rest.x+.002,rest.y,rest.z,a);volume.sample(rest.x,rest.y+.002,rest.z,b);
  const rotX=T.MathUtils.clamp((b.z-v.z)/.002*.4,-.22,.22),rotZ=T.MathUtils.clamp(-(b.x-v.x)/.002*.4,-.22,.22);
  q.setFromEuler(new T.Euler(rotX,0,rotZ));fruit.quaternion.copy(quaternion).premultiply(q);
 }
}
async function boot(){
 renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=.88;
 const scene=new T.Scene();camera=new T.PerspectiveCamera(35.5,1,.003,3);
 const distance=.245,az=T.MathUtils.degToRad(113.5),elevation=T.MathUtils.degToRad(32.5);
 camera.position.set(Math.sin(az)*Math.cos(elevation)*distance,.027+Math.sin(elevation)*distance,Math.cos(az)*Math.cos(elevation)*distance);
 controls=new OrbitControls(camera,canvas);controls.target.set(0,.027,0);controls.enableDamping=true;controls.dampingFactor=.08;controls.rotateSpeed=.7;controls.zoomSpeed=.8;controls.panSpeed=.8;controls.enablePan=true;controls.minDistance=.11;controls.maxDistance=.6;controls.minPolarAngle=T.MathUtils.degToRad(1);controls.maxPolarAngle=T.MathUtils.degToRad(82);controls.update();
 art=await createArtwork(renderer,scene);if(disposed)return;
 pipeline=createPaintingPipeline(renderer,scene,camera,art);
 art.setFlavor(currentFlavor);configureTheme();
 let previousAspect=1;
 const resize=()=>{const {width,height}=canvas.getBoundingClientRect();const aspect=width/height;const oldScale=1/Math.min(1,previousAspect),newScale=1/Math.min(1,aspect);camera.position.sub(controls.target).multiplyScalar(newScale/oldScale).add(controls.target);previousAspect=aspect;renderer.setSize(width,height,false);camera.aspect=aspect;camera.updateProjectionMatrix();pipeline.resize(width,height);};
 const observer=new ResizeObserver(resize);observer.observe(canvas.parentElement);resize();
 document.documentElement.dataset.state='ready';loader.remove();
 renderer.setAnimationLoop(()=>{
  const now=performance.now(),dt=Math.min(.05,(now-previous)/1000);previous=now;if(document.hidden)return;
  const motion=interaction.update(dt);volume.update(dt,motion);warpMesh(art.jelly);warpMesh(art.cream);moveFruits(dt);art.ground.material.uniforms.shadowCenter.value.set(art.cup.position.x,art.cup.position.z);for(const star of art.stars.children)star.material.opacity=.6+.15*Math.sin(now*.0012+star.userData.phase);controls.update();pipeline.render();frame++;
 });
 window.addEventListener('pagehide',()=>{disposed=true;observer.disconnect();interaction.dispose();renderer.setAnimationLoop(null);pipeline.dispose();renderer.dispose();},{once:true});
}
boot().catch(error=>{loader.remove();notice.hidden=false;notice.textContent='场景未能加载，请刷新重试。';console.error(error);});
