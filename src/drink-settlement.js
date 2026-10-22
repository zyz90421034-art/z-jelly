import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {cakePartGeometry} from './cake-geometry.js';

// Settling uses the same rounded solids as the renderer, including half berries
// and tilted slices. The height field is temporary; no physics loop keeps moving
// a fruit after the initial contact layout has been built.
function geometry(p){
 const g=cakePartGeometry(p)||(p.type==='cylinder'?new T.CylinderGeometry(.5,.5,1,12,1):p.type==='ellipsoid'?new T.SphereGeometry(.5,12,8):new RoundedBoxGeometry(1,1,1,2,.12));
 g.scale(...p.size);g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...p.rotation)));g.translate(...p.position);return g;
}
function surface(parts,step,radius){
 const cells=new Map(),vertices=[];
 for(const p of parts){const g=geometry(p),pos=g.attributes.position,index=g.index;
  for(let i=0;i<pos.count;i++)vertices.push([pos.getX(i),pos.getY(i),pos.getZ(i)]);
  const count=index?.count||pos.count;
  for(let k=0;k<count;k+=3){const a=[0,1,2].map(j=>{const i=index?index.getX(k+j):k+j;return [pos.getX(i),pos.getY(i),pos.getZ(i)];}),[v0,v1,v2]=a;
   const denominator=(v1[2]-v2[2])*(v0[0]-v2[0])+(v2[0]-v1[0])*(v0[2]-v2[2]);if(Math.abs(denominator)<1e-12)continue;
   const x0=Math.ceil(Math.min(...a.map(v=>v[0]))/step),x1=Math.floor(Math.max(...a.map(v=>v[0]))/step),z0=Math.ceil(Math.min(...a.map(v=>v[2]))/step),z1=Math.floor(Math.max(...a.map(v=>v[2]))/step);
   for(let z=z0;z<=z1;z++)for(let x=x0;x<=x1;x++){
    const px=x*step,pz=z*step,u=((v1[2]-v2[2])*(px-v2[0])+(v2[0]-v1[0])*(pz-v2[2]))/denominator,v=((v2[2]-v0[2])*(px-v2[0])+(v0[0]-v2[0])*(pz-v2[2]))/denominator;
    if(u<-.00001||v<-.00001||u+v>1.00001)continue;
    const y=u*v0[1]+v*v1[1]+(1-u-v)*v2[1],key=x+','+z,c=cells.get(key);
    if(c){c.low=Math.min(c.low,y);c.high=Math.max(c.high,y);}else cells.set(key,{x,z,low:y,high:y});
   }
  }g.dispose();
 }
 return {cells:[...cells.values()],vertices,minY:Math.min(...vertices.map(v=>v[1]))};
}
function hull(points){
 const unique=[...new Map(points.map(p=>[p[0].toFixed(5)+','+p[1].toFixed(5),p])).values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
 if(unique.length<3)return unique;
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]),lower=[],upper=[];
 for(const p of unique){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
 for(const p of unique.slice().reverse()){while(upper.length>1&&cross(upper.at(-2),upper.at(-1),p)<=0)upper.pop();upper.push(p);}
 return lower.slice(0,-1).concat(upper.slice(0,-1));
}
function margin(points,center){
 const polygon=hull(points);if(polygon.length<3)return -.05;
 let value=Infinity;for(let i=0;i<polygon.length;i++){const a=polygon[i],b=polygon[(i+1)%polygon.length],dx=b[0]-a[0],dz=b[1]-a[1];value=Math.min(value,(dx*(center[1]-a[1])-dz*(center[0]-a[0]))/Math.hypot(dx,dz));}return value;
}
function transformed(group,turn,pivot){
 return group.map(p=>{const q=new T.Quaternion().setFromEuler(new T.Euler(...p.rotation)).premultiply(turn),v=new T.Vector3(...p.position).sub(pivot).applyQuaternion(turn).add(pivot);return {...p,position:v.toArray(),rotation:new T.Euler().setFromQuaternion(q).toArray().slice(0,3)};});
}
function fit(group,step,radius){
 let samples=surface(group,step,radius);
 for(let k=0;k<32;k++){
  const far=samples.vertices.reduce((a,b)=>Math.hypot(b[0],b[2])>Math.hypot(a[0],a[2])?b:a),d=Math.hypot(far[0],far[2]);if(d<=radius-.002)break;
  const dx=-far[0]/d*(d-radius+.003),dz=-far[2]/d*(d-radius+.003);for(const p of group){p.position[0]+=dx;p.position[2]+=dz;}for(const v of samples.vertices){v[0]+=dx;v[2]+=dz;}
 }
 return surface(group,step,radius);
}
function massCenter(body){
 const offset=new T.Vector3(0,body.type==='berry'?body.size[1]*.04:0,body.type==='berry-half'?-body.size[2]*.21:0).applyEuler(new T.Euler(...body.rotation));return new T.Vector3(...body.position).add(offset);
}
export function settleDrinkFruit(parts,{floor,radius,step=.008}){
 const bodies=parts.filter(p=>p.fruitType).sort((a,b)=>a.position[1]-b.position[1]),heights=new Map(),contacts=[];
 for(const body of bodies){
  const source=parts.filter(p=>p.name===body.name||p.name.startsWith(body.name+'-')),pivot=new T.Vector3(...body.position);
  const angles=body.type==='blueberry'?[[0,0,0]]:[[0,0,0],[.45,0,0],[-.45,0,0],[.9,0,0],[-.9,0,0],[0,0,.45],[0,0,-.45],[0,0,.95],[0,0,-.95],[.55,.35,.45],[-.55,-.35,-.45]];
  const turns=angles.map(a=>new T.Quaternion().setFromEuler(new T.Euler(...a)));
  if(body.type==='cylinder'){const normal=new T.Vector3(0,1,0).applyEuler(new T.Euler(...body.rotation));turns.push(new T.Quaternion().setFromUnitVectors(normal,new T.Vector3(0,1,0)));}
  if(body.type==='berry'||body.type==='berry-half'){const axis=new T.Vector3(0,1,0).applyEuler(new T.Euler(...body.rotation));for(const target of [new T.Vector3(1,0,0),new T.Vector3(0,0,1)])turns.push(new T.Quaternion().setFromUnitVectors(axis,target));}
  let best=null;
  for(const turn of turns){
   const group=transformed(source,turn,pivot),samples=fit(group,step,radius),mass=massCenter(group[0]);
   const face=group.find(p=>p.fruitDetail&&/face$/.test(p.fruitDetail));
   const faceNormal=face?new T.Vector3(0,face.type==='cylinder'?1:0,face.type==='cylinder'?0:1).applyEuler(new T.Euler(...face.rotation)):null;
   const visibility=faceNormal?.dot(new T.Vector3(0,.48,.88).normalize())??1;
   for(let iz=-24;iz<=24;iz+=6)for(let ix=-6;ix<=6;ix+=3){
    const dx=ix*step,dz=iz*step;if(samples.vertices.some(v=>Math.hypot(v[0]+dx,v[2]+dz)>radius+.001))continue;
    let drop=floor-samples.minY,support='vessel',point=null;
    for(const c of samples.cells){const below=heights.get((c.x+ix)+','+(c.z+iz));if(below&&below.y-c.low>drop){drop=below.y-c.low;support=below.owner;point=[(c.x+ix)*step,below.y,(c.z+iz)*step];}}
    const touching=[];
    for(const c of samples.cells){const below=heights.get((c.x+ix)+','+(c.z+iz));if(c.low+drop-(below?.y??floor)<.014)touching.push([(c.x+ix)*step,(c.z+iz)*step]);}
    // Leaning on the cavity wall can stabilize an inclined slice together with
    // a lower fruit; wall contact is recorded separately from its lower support.
    let wallLean=false;for(const v of samples.vertices)if(Math.hypot(v[0]+dx,v[2]+dz)>radius-.004&&v[1]+drop>floor+.02){touching.push([v[0]+dx,v[2]+dz]);wallLean=true;}
    const stability=margin(touching,[mass.x+dx,mass.z+dz]);
    const score=mass.y+drop+Math.max(0,-stability)*2.8+(stability<.003?.008:0)+(dx*dx+dz*dz)*1.8+turn.angleTo(new T.Quaternion())**2*.006+(1-visibility)*.10;
    const stable=stability>=-.003;
    if(!best||stable&&!best.stable||stable===best.stable&&score<best.score)best={group,samples,dx,dz,drop,support,point,ix,iz,score,stability,wallLean,stable};
   }
  }
  if(!best)throw Error('水果尺寸无法放入杯中，请换一张主体更清晰的照片。');
  for(let i=0;i<source.length;i++){source[i].position=best.group[i].position.map((n,j)=>n+[best.dx,best.drop,best.dz][j]);source[i].rotation=best.group[i].rotation;}
  body.supportedBy=best.support;
  const lowest=best.samples.vertices.reduce((a,b)=>b[1]<a[1]?b:a);
  contacts.push({part:body.name,target:best.support,point:best.point||[lowest[0]+best.dx,floor,lowest[2]+best.dz],stabilityMargin:best.stability,wallLean:best.wallLean});
  for(const c of best.samples.cells){const key=(c.x+best.ix)+','+(c.z+best.iz),y=c.high+best.drop,old=heights.get(key);if(!old||old.y<y)heights.set(key,{y,owner:body.name});}
 }
 return contacts;
}
