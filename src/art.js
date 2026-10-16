import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';

// Original procedural brushwork. No textures or models copied from the reference.
let seed=27;
const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
function brushTexture(){
  const c=document.createElement('canvas');c.width=c.height=512;
  const x=c.getContext('2d');x.fillStyle='#888888';x.fillRect(0,0,512,512);
  for(let i=0;i<1600;i++){
    const px=random()*512,py=random()*512,w=1+random()*12,h=5+random()*50;
    x.save();x.translate(px,py);x.rotate(-.5+random()*.9);
    const v=Math.round(80+random()*105);x.fillStyle=`rgba(${v},${v},${v},${.12+random()*.3})`;x.fillRect(-w/2,-h/2,w,h);x.restore();
  }
  const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
const bump=brushTexture();
function paint(color,extra={}){
  return new THREE.MeshStandardMaterial({color,roughness:.8,metalness:0,bumpMap:bump,bumpScale:.035,...extra});
}
function mesh(geometry,material,parent,x=0,y=0,z=0){const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
function shadow(){
 const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');
 const g=x.createRadialGradient(128,128,5,128,128,125);g.addColorStop(0,'rgba(79,52,125,.65)');g.addColorStop(.4,'rgba(86,64,138,.42)');g.addColorStop(1,'rgba(104,79,158,0)');x.fillStyle=g;x.fillRect(0,0,256,256);
 return new THREE.CanvasTexture(c);
}
export function createArt(scene,jellyGeometry){
 scene.background=new THREE.Color('#6cbbdc');scene.fog=new THREE.Fog('#6cbbdc',8,20);
 scene.add(new THREE.HemisphereLight('#e1e6ff','#9770aa',2.1));
 const light=new THREE.DirectionalLight('#fff1d7',2.1);light.position.set(-3,6,4);scene.add(light);
 const fill=new THREE.DirectionalLight('#b7b4ff',.7);fill.position.set(3,2,-3);scene.add(fill);
 const ground=mesh(new THREE.PlaneGeometry(200,200),new THREE.MeshBasicMaterial({color:'#6cbbdc'}),scene);ground.rotation.x=-Math.PI/2;ground.position.y=-.015;
 const cup=new THREE.Group();scene.add(cup);
 const cast=mesh(new THREE.PlaneGeometry(3.9,3.4),new THREE.MeshBasicMaterial({map:shadow(),transparent:true,depthWrite:false}),cup,-.38,.002,-.25);cast.rotation.x=-Math.PI/2;
 const cream=mesh(new THREE.CylinderGeometry(.865,.735,.29,64),paint('#f2b98f',{roughness:.9,bumpScale:.015}),cup,0,.19,0);
 const jellyMaterial=new THREE.MeshPhysicalMaterial({color:'#f5dbfa',transmission:.94,thickness:.36,ior:1.15,roughness:.19,metalness:0,bumpMap:bump,bumpScale:.022,attenuationColor:new THREE.Color('#e4b8f3'),attenuationDistance:2,envMapIntensity:.2,clearcoat:0,emissive:'#9773ba',emissiveIntensity:.1});
 const jelly=mesh(jellyGeometry,jellyMaterial,cup);jelly.frustumCulled=false;
 const contents=new THREE.Group();cup.add(contents);
 // Embedded cherries, each with asymmetric lobes and a thin curved stem.
 const red=paint('#bb164c',{roughness:.55,bumpScale:.028});
 for(const [x,y,z,r] of [[-.32,.95,.31,.21],[-.06,1.02,.12,.20],[.24,.63,.26,.19]]){
   const group=new THREE.Group();group.position.set(x,y,z);contents.add(group);
   const cherry=mesh(new THREE.SphereGeometry(r,28,20),red,group);cherry.scale.set(1,.92,.92);
   mesh(new THREE.SphereGeometry(r*.68,20,16),red,group,r*.37,.01,-.02);
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,r*.8,0),new THREE.Vector3(.02,r+ .12,0),new THREE.Vector3(.10,r+.17,-.02)]);
   mesh(new THREE.TubeGeometry(curve,12,.009,5,false),paint('#8b6747'),group);
 }
 const orange=paint('#e6a23d',{roughness:.72,bumpScale:.03});
 for(let i=0;i<3;i++){
   const fruit=mesh(new THREE.SphereGeometry(.23,20,14,0,Math.PI*1.8),orange,contents,.36-i*.04,.79+i*.12,-.24+i*.09);
   fruit.scale.set(1,.54,.7);fruit.rotation.set(.4,i*.5,.35+i*.6);
 }
 const white=paint('#ffe7d4',{roughness:.8,bumpScale:.018});
 for(const [x,y,z] of [[-.35,.57,-.14],[.20,.49,-.3]])mesh(new THREE.SphereGeometry(.17,24,16),white,contents,x,y,z).scale.set(1,.84,1);
 const kiwiMaterial=paint('#a4b953',{roughness:.75,bumpScale:.025});
 const kiwi=mesh(new THREE.CylinderGeometry(.20,.20,.07,32),kiwiMaterial,contents,-.3,.78,-.28);kiwi.rotation.set(1,.2,.3);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const pit=mesh(new THREE.SphereGeometry(.009,6,6),paint('#595039'),kiwi,Math.cos(a)*.12,.039,Math.sin(a)*.12);pit.scale.set(.6,.5,1.4);}
 const glassMat=new THREE.MeshPhysicalMaterial({color:'#e4cefb',transparent:true,opacity:.15,side:THREE.DoubleSide,roughness:.3,metalness:0,bumpMap:bump,bumpScale:.04,depthWrite:false,envMapIntensity:.1});
 const profile=[new THREE.Vector2(.72,.045),new THREE.Vector2(.77,.075),new THREE.Vector2(.82,.35),new THREE.Vector2(.92,.95),new THREE.Vector2(.99,1.43),new THREE.Vector2(1.015,1.45)];
 const glass=mesh(new THREE.LatheGeometry(profile,80),glassMat,cup);glass.renderOrder=5;
 // Broken, hand-painted reflections rather than perfect white outlines.
 const reflection=new THREE.MeshBasicMaterial({color:'#f6ddf5',transparent:true,opacity:.52,depthWrite:false,side:THREE.DoubleSide});
 for(const [radius,y,arc,angle] of [[1.014,1.45,2.9,0],[1.012,1.445,1.8,3.4],[.755,.09,2,1.2]]){
   const rim=mesh(new THREE.TorusGeometry(radius,.017,6,100,arc),reflection,cup,0,y,0);rim.rotation.x=Math.PI/2;rim.rotation.z=angle;rim.renderOrder=6;
 }
 const streakMat=new THREE.MeshBasicMaterial({color:'#f3d7f0',transparent:true,opacity:.20,depthWrite:false,side:THREE.DoubleSide});
 for(let i=0;i<9;i++){
   const angle=i*.71+.25,y=.4+random()*.55,r=.82+y*.13;
   const streak=mesh(new THREE.PlaneGeometry(.018+random()*.045,.15+random()*.35),streakMat,cup,Math.cos(angle)*r,y,Math.sin(angle)*r);streak.rotation.y=-angle+Math.PI/2;streak.rotation.z=.12;
 }
 const rimShadow=mesh(new THREE.TorusGeometry(.77,.016,8,80,Math.PI*1.6),new THREE.MeshBasicMaterial({color:'#a88eb8',transparent:true,opacity:.35,depthWrite:false}),cup,0,.06,0);rimShadow.rotation.x=Math.PI/2;
 function setFlavor(flavor){
   const green=flavor==='matcha',mango=flavor==='mango';
   jellyMaterial.color.set(green?'#edf5ca':mango?'#ffedba':'#f5dbfa');jellyMaterial.attenuationColor.set(green?'#c3d67c':mango?'#f9c46b':'#e4b8f3');jellyMaterial.emissive.set(green?'#859a64':mango?'#bc9159':'#9773ba');
   cream.material.color.set(green?'#d7dc95':mango?'#f1ca91':'#f2b98f');
   red.color.set(green?'#769a42':mango?'#e6a134':'#bb164c');orange.color.set(green?'#d5db75':mango?'#efbc47':'#e6a23d');
 }
 return {cup,jelly,garnish:contents,setFlavor};
}
export function createPainter(renderer,scene,camera){
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const pass=new ShaderPass({uniforms:{tDiffuse:{value:null},resolution:{value:new THREE.Vector2(800,800)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`
 uniform sampler2D tDiffuse;uniform vec2 resolution;varying vec2 vUv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
 void main(){vec2 px=1./resolution;vec2 p=vUv*resolution;float stroke=noise(p/vec2(5.,13.));vec2 jitter=vec2(stroke-.5,noise(p/9.)-.5)*px*1.7;
 vec3 c=texture2D(tDiffuse,vUv+jitter).rgb;vec3 a=texture2D(tDiffuse,vUv+vec2(2.,1.)*px).rgb;vec3 b=texture2D(tDiffuse,vUv-vec2(2.,1.)*px).rgb;
 c=mix(c,(a+b+c)/3.,.22);float grain=hash(p),fib=noise(p/vec2(2.,5.));c+=(grain-.5)*.065+(fib-.5)*.035;
 float fleck=smoothstep(.92,.99,grain)*.12;c=mix(c,vec3(.94,.87,.84),fleck);c*=.97+stroke*.055;
 gl_FragColor=vec4(c,1.);}`});composer.addPass(pass);composer.addPass(new OutputPass());
 return {render:()=>composer.render(),resize:(w,h)=>{composer.setSize(w,h);pass.uniforms.resolution.value.set(w*renderer.getPixelRatio(),h*renderer.getPixelRatio());}};
}
