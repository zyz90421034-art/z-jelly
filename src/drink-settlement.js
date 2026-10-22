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
export function settleDrinkFruit(parts,{floor,radius,step=.006}){
 const bodies=parts.filter(p=>p.fruitType).sort((a,b)=>a.position[1]-b.position[1]),heights=new Map(),contacts=[];
 const shift=(group,x,y,z)=>{for(const p of group){p.position[0]+=x;p.position[1]+=y;p.position[2]+=z;}};
 for(const body of bodies){
  const group=parts.filter(p=>p.name===body.name||p.name.startsWith(body.name+'-'));
  // Fit the complete decorated fruit into the cavity before finding its support.
  let samples=surface(group,step,radius);
  for(let k=0;k<24;k++){
   const far=samples.vertices.reduce((a,b)=>Math.hypot(b[0],b[2])>Math.hypot(a[0],a[2])?b:a),d=Math.hypot(far[0],far[2]);if(d<=radius-.002)break;
   const dx=-far[0]/d*(d-radius+.003),dz=-far[2]/d*(d-radius+.003);shift(group,dx,0,dz);for(const v of samples.vertices){v[0]+=dx;v[2]+=dz;}
  }
  samples=surface(group,step,radius);
  let best=null;
  // Nearby lateral moves find pockets between lower pieces rather than balancing
  // every fruit directly over a single front-facing column.
  for(let iz=-30;iz<=30;iz+=6)for(let ix=-8;ix<=8;ix+=2){
   const dx=ix*step,dz=iz*step;
   if(samples.vertices.some(v=>Math.hypot(v[0]+dx,v[2]+dz)>radius+.001))continue;
   let drop=floor-samples.minY,support='vessel',contact=null;
   for(const c of samples.cells){const key=(c.x+ix)+','+(c.z+iz),below=heights.get(key);if(below&&below.y-c.low>drop){drop=below.y-c.low;support=below.owner;contact=[(c.x+ix)*step,below.y,(c.z+iz)*step];}}
   const score=drop+(dx*dx+dz*dz)*2;
   if(!best||score<best.score)best={dx,dz,drop,support,contact,ix,iz,score};
  }
  // The fitted original location is always a valid fallback for very wide pieces.
  if(!best){let drop=floor-samples.minY,support='vessel',contact=null;for(const c of samples.cells){const below=heights.get(c.x+','+c.z);if(below&&below.y-c.low>drop){drop=below.y-c.low;support=below.owner;contact=[c.x*step,below.y,c.z*step];}}best={dx:0,dz:0,drop,support,contact,ix:0,iz:0};}
  shift(group,best.dx,best.drop,best.dz);body.supportedBy=best.support;
  const lowest=samples.vertices.reduce((a,b)=>b[1]<a[1]?b:a);
  contacts.push({part:body.name,target:best.support,point:best.contact||[lowest[0]+best.dx,floor,lowest[2]+best.dz]});
  for(const c of samples.cells){const key=(c.x+best.ix)+','+(c.z+best.iz),y=c.high+best.drop,old=heights.get(key);if(!old||old.y<y)heights.set(key,{y,owner:body.name});}
 }
 return contacts;
}
