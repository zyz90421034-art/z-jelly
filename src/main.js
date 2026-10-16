import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {createArt,createPainter} from './art.js';
import { JellyPhysics, defaults } from './physics.js';
import './style.css';

const canvas = document.querySelector('#scene');
const params = { ...defaults };
const physics = new JellyPhysics();
const flavors = {
  berry: { color: '#c94954', top: '#db6a6a', name: '草莓 / STRAWBERRY', leaf: '#6a8350' },
  matcha: { color: '#91a45c', top: '#a6b471', name: '抹茶 / MATCHA', leaf: '#526c41' },
  mango: { color: '#eba62e', top: '#f4bf58', name: '芒果 / MANGO', leaf: '#6a8350' },
};
let elapsed = 0, shakeTime = 10, currentFlavor = 'berry';
let renderer, scene, camera, controls, cup, jelly, garnish;
let meshData, resizeObserver, painter, art;
const cupPosition = new THREE.Vector2(), cupVelocity = new THREE.Vector2(), target = new THREE.Vector2();
let dragging = false, pointerId = null;
const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2(), floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.45);
const hit = new THREE.Vector3(), grab = new THREE.Vector2();
const studies = [ ['berry','草莓','#c96671','#df8d91'], ['matcha','抹茶','#91a66a','#bac68e'], ['mango','芒果','#dda841','#f1c56b'] ];
for (const [flavor,label,color,top] of studies) {
  const button=document.createElement('button');button.className=`study${flavor==='berry'?' active':''}`;button.dataset.flavor=flavor;button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(flavor==='berry'));
  button.innerHTML=`<svg viewBox="0 0 80 92" aria-hidden="true"><path class="plate" d="M8 69Q40 54 72 69Q76 81 40 84Q4 82 8 69Z"/><path fill="${color}" d="M22 27Q40 18 58 27L64 65Q40 79 16 65Z"/><ellipse fill="${top}" cx="40" cy="27" rx="18" ry="7"/><path class="shine" d="M24 35L21 61M29 29Q39 26 49 29"/><circle fill="${color}" cx="42" cy="16" r="6"/><path fill="#7a9560" d="M41 11Q28 1 31 12Q36 16 41 11M41 11Q55 0 52 10Q48 14 41 11"/></svg>`;
  document.querySelector('.flavors').append(button);
}
function shake() { shakeTime = 0; canvas.focus({ preventScroll: true }); }
document.querySelectorAll('[data-flavor]').forEach(b => b.addEventListener('click', () => setFlavor(b.dataset.flavor)));
function setFlavor(flavor) {
  currentFlavor = flavor;
  document.querySelectorAll('[data-flavor]').forEach(b => {
    const active = b.dataset.flavor === flavor; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active));
  });
  art?.setFlavor(flavor);
}
window.addEventListener('keydown', event => {
  if (event.target instanceof HTMLInputElement || event.ctrlKey || event.metaKey || event.altKey) return;
  if (event.code === 'KeyS' && !event.repeat) { event.preventDefault(); shake(); }
  if (document.activeElement === canvas && event.code.startsWith('Arrow')) {
    event.preventDefault();
    const sign = event.code === 'ArrowLeft' || event.code === 'ArrowDown' ? -1 : 1;
    if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') cupVelocity.x += sign * 1.2;
    else cupVelocity.y += sign * 1.2;
  }
});

function createJellyGeometry() {
  const segments = 64, layers = physics.count, points = [], indices = [];
  // A closed moulded dessert, independent from reference artwork.
  for (let row = 0; row < layers; row++) {
    const t = row / (layers - 1), y = 0.34 + t * 0.95;
    const radius = THREE.MathUtils.lerp(0.805, 0.951, t) * (row === 0 || row === layers - 1 ? 0.97 : 1);
    for (let col = 0; col <= segments; col++) {
      const angle = col / segments * Math.PI * 2, flute = 1 + 0.027 * Math.cos(angle * 10);
      points.push(Math.cos(angle) * radius * flute, y, Math.sin(angle) * radius * flute);
    }
  }
  for (let row = 0; row < layers - 1; row++) for (let col = 0; col < segments; col++) {
    const a = row * (segments + 1) + col, b = a + segments + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const top = points.length / 3; points.push(0, 1.29, 0);
  const bottom = points.length / 3; points.push(0, 0.34, 0);
  for (let col = 0; col < segments; col++) {
    const offset = (layers - 1) * (segments + 1);
    indices.push(top, offset + col + 1, offset + col);
    indices.push(bottom, col, col + 1);
  }
  const geometry = new THREE.BufferGeometry(); geometry.setIndex(indices);
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
  const uvs=[];for(let row=0;row<layers;row++)for(let col=0;col<=segments;col++)uvs.push(col/segments,row/(layers-1));uvs.push(.5,.5,.5,.5);geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();
  meshData = { base: new Float32Array(points), segments, layers, top, bottom };
  return geometry;
}
function createScene() {
  renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
  scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(34,1,.1,50);camera.position.set(3.3,2.5,5.1);
  controls=new OrbitControls(camera,canvas);controls.target.set(0,.74,0);controls.enableDamping=true;controls.enablePan=false;
  controls.minDistance=4.6;controls.maxDistance=8;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI*.47;
  art=createArt(scene,createJellyGeometry());({cup,jelly,garnish}=art);
  for(const child of garnish.children)child.userData.rest=child.position.clone();
  painter=createPainter(renderer,scene,camera);
  resizeObserver=new ResizeObserver(resize);resizeObserver.observe(canvas.parentElement);resize();setupPointer();renderer.setAnimationLoop(frame);
}
function resize() {
  const {width,height}=canvas.getBoundingClientRect();
  renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();
  painter.resize(width,height);
  controls.target.set(0,.74,0);

}
function pointerRay(event) {
  const bounds=canvas.getBoundingClientRect(); mouse.set((event.clientX-bounds.left)/bounds.width*2-1,-(event.clientY-bounds.top)/bounds.height*2+1);
  raycaster.setFromCamera(mouse,camera);
}
function setupPointer() {
  canvas.addEventListener('pointerdown', event => {
    if(event.button!==0||dragging)return;
    pointerRay(event);
    if(!raycaster.intersectObject(jelly,false).length)return;
    if(!raycaster.ray.intersectPlane(floorPlane,hit))return;
    event.stopImmediatePropagation(); dragging=true;pointerId=event.pointerId;controls.enabled=false;
    grab.set(hit.x-cupPosition.x,hit.z-cupPosition.y);target.copy(cupPosition);
    canvas.setPointerCapture(event.pointerId);canvas.style.cursor='grabbing';canvas.focus({preventScroll:true});
  },true);
  canvas.addEventListener('pointermove',event=>{
    pointerRay(event);
    if(dragging&&event.pointerId===pointerId) {
      if(raycaster.ray.intersectPlane(floorPlane,hit))target.set(hit.x-grab.x,hit.z-grab.y).clampLength(0,.72);
      event.stopImmediatePropagation();
    } else canvas.style.cursor=raycaster.intersectObject(jelly,false).length?'grab':'default';
  },true);
  const release=event=>{
    if(!dragging||event.pointerId!==pointerId)return;
    dragging=false;controls.enabled=true;target.set(0,0);canvas.style.cursor='grab';
    if(canvas.hasPointerCapture(pointerId))canvas.releasePointerCapture(pointerId);pointerId=null;
  };
  for(const name of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(name,release,true);
  window.addEventListener('blur',()=>{dragging=false;controls.enabled=true;target.set(0,0);pointerId=null;});
}
function deform() {
  const p=jelly.geometry.attributes.position, base=meshData.base;
  for(let i=0;i<p.count;i++) {
    let row=i===meshData.top?physics.count-1:i===meshData.bottom?0:Math.floor(i/(meshData.segments+1));
    const x=physics.x[row],z=physics.z[row], t=row/(physics.count-1);
    const prev=Math.max(0,row-1),next=Math.min(physics.count-1,row+1);
    const sx=(physics.x[next]-physics.x[prev])*3,sz=(physics.z[next]-physics.z[prev])*3;
    const wobbleY=-(base[i*3]*sx+base[i*3+2]*sz)*t;
    p.setXYZ(i,base[i*3]+x,base[i*3+1]+wobbleY,base[i*3+2]+z);
  }
  p.needsUpdate=true;jelly.geometry.computeVertexNormals();
  const top=physics.count-1;
  for(const child of garnish.children){const rest=child.userData.rest;const row=Math.max(0,Math.min(top,Math.round((rest.y-.34)/.95*top)));child.position.set(rest.x+physics.x[row]*.8,rest.y,rest.z+physics.z[row]*.8);child.rotation.z=-physics.x[row]*.2;}
}
const clock=new THREE.Clock();
function frame() {
  const dt=Math.min(clock.getDelta(),.04); controls.update();
  if(!document.hidden) {
    elapsed+=dt;shakeTime+=dt;
    if(!dragging&&shakeTime<1.25) {
      const envelope=Math.sin(Math.PI*shakeTime/1.25);
      target.set(Math.sin(shakeTime*24)*.24*envelope,Math.sin(shakeTime*18)*.08*envelope);
    } else if(!dragging)target.set(0,0);
    const ax=THREE.MathUtils.clamp((target.x-cupPosition.x)*105-cupVelocity.x*12,-35,35);
    const az=THREE.MathUtils.clamp((target.y-cupPosition.y)*105-cupVelocity.y*12,-35,35);
    cupVelocity.x+=ax*dt;cupVelocity.y+=az*dt;cupPosition.addScaledVector(cupVelocity,dt);
    physics.step(dt,ax,az,params);cup.position.set(cupPosition.x,0,cupPosition.y);
    deform();
  }
  painter.render();
}
document.addEventListener('visibilitychange',()=>{clock.getDelta();});
try { createScene(); } catch(error) {
  const notice=document.querySelector('#notice');notice.hidden=false;notice.textContent='三维场景未能启动。请启用浏览器硬件加速后刷新页面。';console.error(error);
}
window.addEventListener('pagehide',()=>{renderer?.setAnimationLoop(null);resizeObserver?.disconnect();controls?.dispose();renderer?.dispose();},{once:true});
