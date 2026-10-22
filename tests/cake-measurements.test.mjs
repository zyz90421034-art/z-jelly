import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {analyzeCakePixels} from '../src/cake-image-analysis.js';
import {buildModelingPrompt,compileModelingPrompt} from '../src/prompt-modeler.js';
import {primitiveStudy} from '../src/semantic-recipes.js';
function syntheticCake(layerCount=3){
 const w=240,h=240,pixels=new Uint8ClampedArray(w*h*4).fill(255);
 const rect=(x,y,bw,bh,c)=>{for(let j=y;j<y+bh;j++)for(let i=x;i<x+bw;i++)pixels.set([...c,255],(j*w+i)*4);};
 let y=100;for(let i=0;i<layerCount;i++){rect(55,y,120,18+i*3,[230,190,100]);y+=18+i*3;if(i<layerCount-1){rect(55,y,120,10,[240,180,195]);y+=10;}}
 const ellipse=(x,y,rx,ry,c)=>{for(let j=y-ry;j<=y+ry;j++)for(let i=x-rx;i<=x+rx;i++)if(((i-x)/rx)**2+((j-y)/ry)**2<=1)pixels.set([...c,255],(j*w+i)*4);};
 ellipse(88,70,13,18,[245,142,110]);ellipse(123,65,14,16,[190,35,40]);ellipse(116,87,10,9,[55,60,85]);
 return {pixels,w,h};
}
test('pixel analysis measures different sponge counts without fixed counts or image identifiers',()=>{
 for(const count of [2,3,4]){const {pixels,w,h}=syntheticCake(count),r=analyzeCakePixels(pixels,w,h);assert.equal(r.layers.length,count);assert.equal(r.reliable,true);assert.equal(r.fillings.length,count-1);}
 const empty=new Uint8ClampedArray(240*240*4).fill(255);assert.equal(analyzeCakePixels(empty,240,240).reliable,false);
});
test('a mixed topping remains two individually placed strawberries and a blueberry',()=>{
 const evidence=JSON.parse(fs.readFileSync(new URL('./fixtures/measured-cake.json',import.meta.url),'utf8'));
 // Deliberately wrong generic caption: strong measured cut-face data must win over a two-layer default.
 const prompt=buildModelingPrompt('cake slice','A two-layer cake with strawberries and blueberries, pink frosting, piped cream, mint and a plate.',[[210,160,170]],evidence),r=compileModelingPrompt(prompt);
 assert.equal(r.parts.filter(p=>p.name.startsWith('sponge-')).length,3);assert.equal(r.parts.filter(p=>p.name.startsWith('filling-')).length,2);
 const fruits=r.parts.filter(p=>p.fruitType);assert.equal(fruits.length,3);assert.equal(fruits.filter(p=>p.fruitType==='strawberry').length,2);assert.equal(fruits.filter(p=>p.fruitType==='blueberry').length,1);
 assert.equal(fruits.filter(p=>p.cut).length,1);assert.ok(r.parts.some(p=>p.type==='berry-cutface'));assert.ok(r.parts.some(p=>p.type==='blueberry-crown'));
 assert.ok(r.parts.some(p=>p.name==='side-coating'));assert.ok(r.parts.some(p=>p.name==='piped-border'));assert.ok(!r.parts.some(p=>p.name.startsWith('mint-')||p.name.startsWith('leaf-')));
 assert.ok(r.parts.find(p=>p.name==='sponge-0').rotation[1]<0);
 const heights=r.parts.filter(p=>p.name.startsWith('sponge-')).map(p=>p.size[1]);assert.ok(new Set(heights.map(h=>h.toFixed(3))).size>1);
 assert.ok(fruits.find(p=>p.cut).position[0]<fruits.find(p=>!p.cut&&p.fruitType==='strawberry').position[0]);
 assert.equal(r.measurements.touching.length,3);
 for(const [a,b]of r.measurements.touching){const pa=r.parts.find(p=>p.name===a),pb=r.parts.find(p=>p.name===b);assert.ok(Math.hypot(pa.position[0]-pb.position[0],pa.position[2]-pb.position[2])<=(pa.size[0]+pb.size[0])*.51,'photo-adjacent fruits must stay in a touching cluster');}
 const model=primitiveStudy(r);assert.ok(model.meshes.every(m=>Array.from(m.geometry.attributes.position.array).every(Number.isFinite)));
 const icing=model.meshes.find(m=>m.name==='icing');icing.geometry.computeBoundingBox();
 for(const fruit of model.meshes.filter(m=>m.userData.sourcePart.fruitType)){fruit.geometry.computeBoundingBox();assert.ok(fruit.geometry.boundingBox.min.y<=icing.geometry.boundingBox.max.y,'rotated fruit must contact the icing');assert.ok(fruit.geometry.boundingBox.min.y>icing.geometry.boundingBox.min.y-.001,'fruit must not sink through the cake');}
 assert.ok(model.meshes.filter(m=>m.userData.role==='contact').every(m=>m.material.transparent&&!m.material.depthWrite));
 assert.ok(model.meshes.reduce((n,m)=>n+(m.geometry.index?.count||m.geometry.attributes.position.count)/3,0)<18000);
 for(const m of model.meshes){m.geometry.dispose();m.material.dispose();}
 assert.equal(r.audit.observedFruit,r.audit.modeledFruit);
});
test('caption-only mixed berries also use separate types, never a global blueberry flag',()=>{
 const r=compileModelingPrompt(buildModelingPrompt('cake slice','A cake with three sponge layers, pink cream, one whole strawberry, half a strawberry and one blueberry.',[[210,160,170]]));
 const fruits=r.parts.filter(p=>p.fruitType);assert.equal(fruits.length,3);assert.ok(fruits.some(p=>p.cut));assert.ok(fruits.some(p=>p.type==='blueberry'));assert.ok(r.uncertainties.length>0);
});
