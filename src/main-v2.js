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
const studies=[['berry','Cherry','#c02954','#bb93cf'],['matcha','Kiwi','#81a748','#d3dc83']];
for(const [flavor,label,fruit,jelly]of studies){const button=document.createElement('button');button.className='study'+(flavor===currentFlavor?' active':'');button.dataset.flavor=flavor;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(flavor===currentFlavor));button.innerHTML=flavor==='matcha'?`<svg viewBox="0 0 80 80" aria-hidden="true"><path fill="#69b5db" d="M1 2L78 1L79 78L2 79Z"/><path fill="#d3dc83" opacity=".85" d="M22 20L58 20L53 65L46 69L34 69L27 65Z"/><path fill="#f4e6b5" d="M26 52L54 52L53 65L46 69L34 69L27 65Z"/><path fill="#dce9ad" d="M25 23L38 20L45 30L32 33Z"/><ellipse fill="#8aa44c" cx="37" cy="30" rx="11" ry="6" transform="rotate(-20 37 30)"/><ellipse fill="#d4e296" cx="37" cy="30" rx="8" ry="4" transform="rotate(-20 37 30)"/><path fill="#647b37" d="M32 28L33 30M37 26L37 28M42 27L41 29M43 31L41 31M35 33L35 31" stroke="#647b37" stroke-width="1"/><path fill="#f3b655" d="M48 26Q60 27 53 40L44 36Z"/><path fill="#eee4b6" d="M30 37L41 35L45 45L34 49Z"/><path fill="#85a24c" d="M44 43L53 41L50 56L42 57Z"/><path fill="none" stroke="#f2e4ff" stroke-width="1.8" opacity=".85" d="M20 20L29 14L50 14L60 20L55 65L47 71L33 71L25 65ZM20 20L29 25L50 25L60 20M29 25L33 71M50 25L47 71"/></svg>`:`<svg viewBox="0 0 80 80" aria-hidden="true"><path fill="#69b5db" d="M1 2L78 1L79 78L2 79Z"/><path fill="${jelly}" opacity=".8" d="M13 25L66 25L59 61Q41 70 21 60Z"/><path fill="#ffc4a4" d="M20 53Q40 59 61 53L59 61Q40 68 21 60Z"/><circle fill="${fruit}" cx="31" cy="35" r="9"/><circle fill="${fruit}" cx="48" cy="42" r="7"/><path fill="#ffc34c" d="M45 30Q63 27 58 41Q51 41 45 30Z"/><path fill="none" stroke="#f2e4ff" stroke-width="2" opacity=".75" d="M12 24Q39 14 67 24Q63 31 12 24M13 25L21 60"/></svg>`;button.addEventListener('click',()=>setFlavor(flavor));document.querySelector('.flavors').append(button);}

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
