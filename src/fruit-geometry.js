import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

function paint(g,color,base){const c=new T.Color(color),b=new T.Color(base),a=[];for(let i=0;i<g.attributes.position.count;i++)a.push(c.r/Math.max(.001,b.r),c.g/Math.max(.001,b.g),c.b/Math.max(.001,b.b));g.setAttribute('color',new T.Float32BufferAttribute(a,3));return g;}
function combine(pieces){const expanded=pieces.map(g=>g.index?g.toNonIndexed():g);const result=mergeGeometries(expanded,false);for(const g of new Set([...pieces,...expanded]))g.dispose();return result;}
function seed(color,base,size,position,rotation=[0,0,0]){const g=new T.SphereGeometry(.5,8,5);g.scale(...size);g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...rotation)));g.translate(...position);return paint(g,color,base);}
const taper=y=>.53+.47*Math.sqrt(Math.max(0,y+.5));
function berry(part){
 const half=part.type==='berry-half',g=new T.SphereGeometry(.5,28,20,half?Math.PI:0,half?Math.PI:Math.PI*2),p=g.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i),t=taper(y);p.setX(i,p.getX(i)*t);p.setZ(i,p.getZ(i)*t);}g.computeVertexNormals();paint(g,part.color,part.color);const pieces=[g];
 for(let row=0;row<4;row++)for(let k=0;k<7-row%2;k++){
  const y=-.28+row*.17,r=Math.sqrt(Math.max(0,.25-y*y))*taper(y),a=k/(7-row%2)*Math.PI*2+row*.43;if(half&&Math.sin(a)>0)continue;
  pieces.push(seed('#f8cf8d',part.color,[.025,.043,.012],[Math.cos(a)*r*1.006,y,Math.sin(a)*r*1.006],[0,Math.PI/2-a,-.12]));
 }
 return combine(pieces);
}
function berryFace(part){
 const shape=new T.Shape();for(let i=0;i<=48;i++){const a=i/48*Math.PI*2,y=Math.sin(a)*.5,x=Math.cos(a)*.5*taper(y);if(i)shape.lineTo(x,y);else shape.moveTo(x,y);}shape.closePath();
 const pieces=[paint(new T.ShapeGeometry(shape),part.color,part.color)];
 const core=new T.Shape();core.moveTo(0,-.37);core.quadraticCurveTo(-.14,-.04,-.105,.32);core.quadraticCurveTo(0,.40,.105,.32);core.quadraticCurveTo(.14,-.04,0,-.37);
 const center=new T.ShapeGeometry(core);center.translate(0,0,.03);pieces.push(paint(center,'#ffd3b6',part.color));
 for(const side of [-1,1])for(let i=0;i<4;i++){const y=-.18+i*.13,points=[new T.Vector3(side*.02,y-.055,.05),new T.Vector3(side*.19,y+.01,.05),new T.Vector3(side*(.29-.025*Math.abs(i-2)),y+.10,.05)];pieces.push(paint(new T.TubeGeometry(new T.CatmullRomCurve3(points),8,.009,3,false),'#ffd1ad',part.color));}
 return combine(pieces);
}
function diskFace(part,citrus){
 const base=part.color,pieces=[];
 if(citrus){
  pieces.push(paint(new T.CylinderGeometry(.5,.5,1,40), '#ffedc5',base));
  for(let k=0;k<9;k++){
   const start=k/9*Math.PI*2+.032,end=(k+1)/9*Math.PI*2-.032,s=new T.Shape();s.moveTo(Math.sin(start)*.07,Math.cos(start)*.07);s.lineTo(Math.sin(start)*.45,Math.cos(start)*.45);
   for(let i=1;i<=6;i++){const a=start+(end-start)*i/6;s.lineTo(Math.sin(a)*.45,Math.cos(a)*.45);}s.lineTo(Math.sin(end)*.07,Math.cos(end)*.07);s.closePath();
   const g=new T.ExtrudeGeometry(s,{depth:.16,bevelEnabled:true,bevelSize:.009,bevelThickness:.025,bevelSegments:1,curveSegments:4});g.rotateX(-Math.PI/2);g.translate(0,.51,0);pieces.push(paint(g,k%3===0?'#ffc165':'#f4a444',base));
   for(let j=0;j<2;j++){const a=(start+end)/2+(j-.5)*.13;pieces.push(seed('#ffd38e',base,[.012,.13,.23],[Math.sin(a)*.28,.70,Math.cos(a)*.28],[0,-a,0]));}
  }
 }else{
  pieces.push(paint(new T.CylinderGeometry(.5,.5,1,40),'#bdcf69',base));
  const center=new T.CylinderGeometry(.105,.10,1.1,20);pieces.push(paint(center,'#e8e9ae',base));
  for(let i=0;i<20;i++){const a=i/20*Math.PI*2,r=.25+(i%2)*.022;
   pieces.push(seed('#61714a',base,[.022,.12,.055],[Math.sin(a)*r,.57,Math.cos(a)*r],[0,-a,0]));
   pieces.push(seed('#d4de94',base,[.009,.07,.25],[Math.sin(a)*.30,.55,Math.cos(a)*.30],[0,-a,0]));
  }
 }
 return combine(pieces);
}
export function fruitPartGeometry(part){
 if(part.fruitDetail==='strawberry-body')return berry(part);
 if(part.fruitDetail==='strawberry-face')return berryFace(part);
 if(part.fruitDetail==='citrus-face')return diskFace(part,true);
 if(part.fruitDetail==='kiwi-face')return diskFace(part,false);
 if(part.fruitDetail==='kiwi-chunk-face'){const g=diskFace(part,false);g.rotateX(Math.PI/2);return g;}
 if(part.fruitDetail==='kiwi-chunk')return new RoundedBoxGeometry(1,1,1,3,.24);
 if(part.fruitDetail==='citrus-rind'||part.fruitDetail==='kiwi-rind'){
  const points=[[0,-.5],[.46,-.5],[.495,-.36],[.5,.30],[.48,.5],[0,.5]].map(([r,y])=>new T.Vector2(r,y));return new T.LatheGeometry(points,32);
 }
 return null;
}
