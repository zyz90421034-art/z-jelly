import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {buildFoodBlueprint,validateBlueprint} from '../src/food-blueprint.js';
import {buildModelingPrompt,compileModelingPrompt} from '../src/prompt-modeler.js';
import {primitiveStudy} from '../src/semantic-recipes.js';
import fs from 'node:fs';
const palette=[[210,155,110],[225,170,180]];
test('captured real-photo VLM observations compile without reverting to the generic dessert template',()=>{
 const cases=JSON.parse(fs.readFileSync(new URL('./fixtures/food-observations.json',import.meta.url),'utf8'));
 for(const c of cases){const recipe=compileModelingPrompt(buildModelingPrompt(c.subject,c.description,palette));assert.equal(recipe.kind,c.expectedKind);
  if(c.expectedKind==='coffee-cup')for(const name of ['vessel','handle','drink','foam','plate'])assert.ok(recipe.parts.some(p=>p.name===name),name);
  if(c.expectedKind==='cake-slice'){assert.equal(recipe.parts.filter(p=>p.name.startsWith('sponge-')).length,2);assert.ok(!recipe.parts.some(p=>p.name==='vessel'));}
 }
});
test('serialized blueprints carry executable geometry data and reject invalid profiles',()=>{
 const prompt=buildModelingPrompt('coffee','A cup of coffee.',palette),recipe=compileModelingPrompt(prompt);
 assert.match(prompt,/^Blueprint: /m);assert.ok(recipe.relations.some(r=>r.part==='drink'&&r.relation==='inside'));
 const bad=JSON.parse(prompt.match(/^Blueprint: (.*)$/m)[1]);bad.parts.find(p=>p.type==='lathe').profile=[[0,0],[Infinity,1],[0,1]];
 assert.throws(()=>compileModelingPrompt(prompt.replace(/^Blueprint: .*$/m,'Blueprint: '+JSON.stringify(bad))));
});
test('coffee is supported without requiring the word cup; observed handle, foam, saucer and colors survive',()=>{
 const r=compileModelingPrompt(buildModelingPrompt('a cappuccino','A blue mug with a handle on the left, cream foam and latte art on a white saucer.',palette));
 assert.equal(r.kind,'coffee-cup');assert.equal(r.parts.find(p=>p.name==='vessel').color,'#94c8d4');
 for(const id of ['vessel','rim','handle','drink','foam','latte-art','plate'])assert.ok(r.parts.some(p=>p.name===id),id);
 assert.equal(r.parts.find(p=>p.name==='handle').side,-1);
 const plain=buildFoodBlueprint('espresso','A short brown cup without a handle. No foam. No plate.',palette);
 for(const id of ['handle','foam','plate','fruit-0'])assert.ok(!plain.parts.some(p=>p.name===id),id);
});
test('whole cake and triangular slice retain layer and fruit counts instead of becoming scoops',()=>{
 const cake=buildFoodBlueprint('a cake','A round chocolate cake with three sponge layers, pink filling, white icing and four strawberries.',palette);
 assert.equal(cake.kind,'cake');assert.equal(cake.parts.filter(p=>p.name.startsWith('sponge-')).length,3);
 assert.equal(cake.parts.filter(p=>p.name.startsWith('fruit-')).length,4);
 assert.ok(cake.parts.filter(p=>p.name.startsWith('fruit-')).every(p=>p.color==='#dc6883'),'cream color must not cross "and four" into strawberry color');
 const slice=buildFoodBlueprint('cake','A triangular slice of yellow cake with two layers and white cream.',palette);
 assert.equal(slice.kind,'cake-slice');assert.ok(slice.parts.some(p=>p.type==='wedge'));assert.ok(!slice.parts.some(p=>p.name==='vessel'));
 assert.notDeepEqual(cake.parts,slice.parts);
 const glazed=buildFoodBlueprint('cake slice','A slice with pinkish-red glaze on top and two cake layers.',palette);
 assert.equal(glazed.parts.find(p=>p.name==='icing')?.color,'#e98fa8');
});
test('parfait separates hollow glass and colored filling; undisclosed decoration is omitted',()=>{
 const r=buildFoodBlueprint('parfait','A tall clear glass with three layers of pink pudding and white cream.',palette);
 assert.equal(r.parts.filter(p=>p.name.startsWith('dessert-layer')).length,3);
 assert.equal(r.parts.find(p=>p.name==='vessel').role,'glass');assert.ok(!r.parts.some(p=>p.name.startsWith('fruit-')));
 assert.ok(r.palette.every(c=>c.every(Number.isFinite)));
});
test('blueprint geometry has finite bounds, distinct optical roles, bounded triangle count and no escaped liquid',()=>{
 for(const [name,caption]of [['coffee','A short transparent glass cup with coffee, foam and a handle.'],['cake','A round cake with three layers and six cherries on white icing.'],['cake slice','A triangular chocolate cake slice with two layers and cream.'],['parfait','A tall clear glass with three layers and three strawberries.']]){
  const r=buildFoodBlueprint(name,caption,palette),m=primitiveStudy(r),b=new T.Box3().setFromObject(m.root);
  assert.ok(Math.abs(b.min.y)<1e-6);assert.ok(Math.abs(Math.max(...b.getSize(new T.Vector3()).toArray())-.082)<1e-6);
  assert.ok(m.meshes.every(mesh=>Array.from(mesh.geometry.attributes.position.array).every(Number.isFinite)));
  assert.ok(m.meshes.reduce((n,mesh)=>n+(mesh.geometry.index?.count||mesh.geometry.attributes.position.count)/3,0)<25000);
  for(const mesh of m.meshes){assert.equal(mesh.layers.isEnabled(2),['glass','ceramic'].includes(mesh.userData.role));mesh.geometry.dispose();mesh.material.dispose();}
 }
 const invalid=buildFoodBlueprint('coffee','A cup of coffee.',palette);invalid.parts.find(p=>p.name==='drink').size[0]=3;assert.throws(()=>validateBlueprint(invalid));
});
