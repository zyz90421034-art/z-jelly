import * as T from 'three';
import {fruitPartGeometry} from './fruit-geometry.js';
export function cakePartGeometry(part){
 if(part.fruitDetail)return fruitPartGeometry(part);
 if(part.type==='berry'||part.type==='berry-half'){
  const half=part.type==='berry-half',g=new T.SphereGeometry(.5,16,12,half?Math.PI:0,half?Math.PI:Math.PI*2);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const taper=.80+.20*(p.getY(i)+.5);p.setX(i,p.getX(i)*taper);p.setZ(i,p.getZ(i)*taper);}g.computeVertexNormals();return g;
 }
 if(part.type==='berry-cutface'){
  const s=new T.Shape();for(let i=0;i<=32;i++){const a=i/32*Math.PI*2,y=Math.sin(a)*.5,x=Math.cos(a)*.5*(.80+.20*(y+.5));if(i===0)s.moveTo(x,y);else s.lineTo(x,y);}return new T.ShapeGeometry(s,24);
 }
 if(part.type==='blueberry')return new T.SphereGeometry(.5,16,10);
 if(part.type==='blueberry-crown'){
  const s=new T.Shape();for(let i=0;i<10;i++){const a=i/10*Math.PI*2,r=i%2?.20:.5;const x=Math.sin(a)*r,y=Math.cos(a)*r;if(!i)s.moveTo(x,y);else s.lineTo(x,y);}s.closePath();const g=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:false});g.translate(0,0,-.5);g.rotateX(-Math.PI/2);return g;
 }
 if(part.type==='leaf'){
  const points=[],indices=[],along=12,across=6,row=across+1,surface=(along+1)*row;
  for(let side=0;side<2;side++)for(let i=0;i<=along;i++)for(let j=0;j<=across;j++){
   const t=i/along,s=j/across*2-1,bend=Math.sin(Math.PI*t),edge=1+.055*Math.sin(t*Math.PI*10);
   points.push(t-.5,bend*(.24-.14*Math.abs(s)+(side?-.04:.04)),s*bend*.5*edge);
  }
  for(let side=0;side<2;side++)for(let i=0;i<along;i++)for(let j=0;j<across;j++){const a=side*surface+i*row+j,b=a+row,c=b+1,d=a+1;if(!side)indices.push(a,d,b,b,d,c);else indices.push(a,b,d,b,c,d);}
  for(let i=0;i<along;i++)for(const j of [0,across]){const a=i*row+j,b=a+row;indices.push(a,a+surface,b,b,a+surface,b+surface);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return g;
 }
 if(part.type==='contact-shadow'){const g=new T.CircleGeometry(.5,24);g.rotateX(-Math.PI/2);return g;}
 if(part.type==='cake-coating'){
  const s=new T.Shape();for(let i=0;i<=24;i++){const t=-1+i/12,x=.43*t,z=-.34-.16*(1-t*t);if(!i)s.moveTo(x,z);else s.lineTo(x,z);}
  for(let i=24;i>=0;i--){const t=-1+i/12;s.lineTo(.43*t,-.34-.16*(1-t*t)+.035);}s.closePath();const g=new T.ExtrudeGeometry(s,{depth:1,bevelEnabled:true,bevelSize:.006,bevelThickness:.008,bevelSegments:1});g.translate(0,0,-.5);g.rotateX(Math.PI/2);return g;
 }
 if(part.type==='cream-ribbon'){
  const points=[];for(let i=0;i<=64;i++){const t=-1+i/32;points.push(new T.Vector3(.40*t,.025*Math.sin(i*.95),-.28-.13*(1-t*t)));}
  const g=new T.TubeGeometry(new T.CatmullRomCurve3(points),64,.055,8,false);g.scale(1,6,1);return g;
 }
 return null;
}
