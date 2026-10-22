import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {fruitPartGeometry} from '../src/fruit-geometry.js';
test('rounded fruit detail has finite mesh data, multiple pigment colors and a bounded face count',()=>{
 for(const [detail,type,color]of [['strawberry-body','berry','#e85d70'],['strawberry-body','berry-half','#e85d70'],['strawberry-face','berry-cutface','#f79a83'],['citrus-face','cylinder','#ffc165'],['kiwi-face','cylinder','#bdcf69']]){
  const g=fruitPartGeometry({fruitDetail:detail,type,color});assert.ok(g.attributes.color,detail);
  for(const name of ['position','normal','color'])assert.ok([...g.attributes[name].array].every(Number.isFinite),detail+' '+name);
  const colors=g.attributes.color,unique=new Set();for(let i=0;i<colors.count;i++)unique.add([colors.getX(i),colors.getY(i),colors.getZ(i)].map(v=>v.toFixed(2)).join(','));assert.ok(unique.size>=2,detail);
  assert.ok((g.index?.count||g.attributes.position.count)/3<6000,detail);
 }
});
test('strawberry silhouette tapers toward the tip and cut fruit retains a substantial curved back',()=>{
 const p={fruitDetail:'strawberry-body',type:'berry-half',color:'#e85d70'},g=fruitPartGeometry(p),a=g.attributes.position;let lower=0,upper=0;
 for(let i=0;i<a.count;i++){if(Math.abs(a.getY(i)+.3)<.035)lower=Math.max(lower,Math.abs(a.getX(i)));if(Math.abs(a.getY(i)-.3)<.035)upper=Math.max(upper,Math.abs(a.getX(i)));}
 assert.ok(upper>lower*1.15);g.computeBoundingBox();assert.ok(g.boundingBox.min.z<-.40);assert.ok(g.boundingBox.max.z<.025);
});
test('citrus flesh is separated by actual pith gaps rather than a ring of raised dots',()=>{
 const g=fruitPartGeometry({fruitDetail:'citrus-face',type:'cylinder',color:'#ffc165'}),m=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));m.updateMatrixWorld();
 const height=a=>{const r=new T.Raycaster(new T.Vector3(Math.sin(a)*.32,2,Math.cos(a)*.32),new T.Vector3(0,-1,0));return r.intersectObject(m)[0].point.y;};
 assert.ok(height(0)>height(Math.PI/9)+.08);
});
