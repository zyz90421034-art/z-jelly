import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {settleDrinkFruit} from '../src/drink-settlement.js';
import {buildFoodBlueprint} from '../src/food-blueprint.js';
import {cakePartGeometry} from '../src/cake-geometry.js';
const ball=(name,y,x=0)=>({name,type:'blueberry',fruitType:'dark-berry',position:[x,y,0],rotation:[0,0,0],size:[.24,.24,.24],color:'#776699',role:'fruit'});
function mesh(p){const g=cakePartGeometry(p)||(p.type==='cylinder'?new T.CylinderGeometry(.5,.5,1,12):new T.SphereGeometry(.5,12,8));g.scale(...p.size);g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...p.rotation)));g.translate(...p.position);const m=new T.Mesh(g,new T.MeshBasicMaterial({side:T.DoubleSide}));m.updateMatrixWorld();return m;}
test('isolated fruit drops onto the inner cup floor and its decoration follows rigidly',()=>{
 const fruit=ball('fruit-0',1.1),decoration={...ball('fruit-0-detail',1.23),fruitType:undefined,size:[.03,.02,.03]},parts=[fruit,decoration],offset=decoration.position[1]-fruit.position[1];
 const c=settleDrinkFruit(parts,{floor:.07,radius:.37});assert.equal(c[0].target,'vessel');
 const m=mesh(fruit);m.geometry.computeBoundingBox();assert.ok(Math.abs(m.geometry.boundingBox.min.y-.07)<1e-6);
 assert.ok(Math.abs(decoration.position[1]-fruit.position[1]-offset)<1e-8);
});
test('overlapping photo projections settle in a contact chain instead of remaining suspended',()=>{
 const parts=[ball('fruit-0',.8),ball('fruit-1',1.4),ball('fruit-2',2.1)],contacts=settleDrinkFruit(parts,{floor:.07,radius:.37});
 assert.equal(contacts[0].target,'vessel');assert.ok(contacts.slice(1).every(c=>c.target.startsWith('fruit-')));
 // Independently raycast the actual rounded meshes at each reported contact.
 for(const c of contacts.slice(1)){const [x,,z]=c.point,upper=mesh(parts.find(p=>p.name===c.part)),lower=mesh(parts.find(p=>p.name===c.target));const down=new T.Raycaster(new T.Vector3(x,4,z),new T.Vector3(0,-1,0)),up=new T.Raycaster(new T.Vector3(x,-1,z),new T.Vector3(0,1,0));const a=down.intersectObject(lower)[0],b=up.intersectObject(upper)[0];assert.ok(a&&b);assert.ok(Math.abs(b.point.y-a.point.y)<.002);}
 for(const p of parts){const m=mesh(p),a=m.geometry.attributes.position;for(let i=0;i<a.count;i++)assert.ok(Math.hypot(a.getX(i),a.getZ(i))<=.371);}
});
test('a fruit drink has one acyclic support path from every piece to its cup',()=>{
 const r=buildFoodBlueprint('glass','Pink juice with strawberries, kiwi, orange and blueberries.',[[244,175,165]]),names=new Map(r.parts.filter(p=>p.fruitType).map(p=>[p.name,p]));
 assert.equal(r.contacts.length,names.size);
 for(const p of names.values()){let name=p.name;const visited=new Set();while(name!=='vessel'){assert.ok(!visited.has(name),'cyclic fruit supports');visited.add(name);name=names.get(name)?.supportedBy;assert.ok(name);}}
 assert.equal(r.parts.find(p=>p.name==='drink').role,'clear-liquid');
});
test('an unsupported upright slice tilts into a lower stable pose instead of balancing on its rim',()=>{
 const p={name:'fruit-0',type:'cylinder',fruitType:'citrus',position:[0,1,0],rotation:[Math.PI/2,0,0],size:[.32,.065,.32],color:'#efad66',role:'fruit'};
 const contacts=settleDrinkFruit([p],{floor:.07,radius:.37});
 assert.ok(p.position[1]<.21);assert.ok(Math.abs(p.rotation[0]-Math.PI/2)>.35);
 assert.ok(contacts[0].stabilityMargin>=-.003);
 const m=mesh(p);m.geometry.computeBoundingBox();assert.ok(Math.abs(m.geometry.boundingBox.min.y-.07)<1e-6);
});
