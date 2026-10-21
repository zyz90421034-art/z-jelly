import test from 'node:test';
import assert from 'node:assert/strict';
import {chooseObject,objectRecipe,primitiveStudy} from '../src/semantic-recipes.js';

test('semantic categories select actual object part grammars',()=>{
 for(const [name,kind,part] of [['red fox','animal','tail'],['gray fox, grey fox','animal','tail'],['stingray','fish','fin'],['cheeseburger','burger','patty'],['coffee mug','bottle','handle'],['tabby cat','animal','ear'],['school bus','vehicle','wheel'],['daisy','plant','petal']]){
  const semantic=chooseObject([{className:name,probability:.8}],null),recipe=objectRecipe(semantic,{palette:[[230,140,80],[141,184,116]]});
  assert.equal(semantic.kind,kind);assert.ok(recipe.parts.some(p=>p.name===part));
  const clone=JSON.parse(JSON.stringify(recipe)),model=primitiveStudy(clone);
  assert.ok(Number.isFinite(model.height)&&model.height>0&&model.radius>0);
  const triangles=model.meshes.reduce((sum,m)=>sum+(m.geometry.index?.count||m.geometry.attributes.position.count)/3,0);
  assert.ok(triangles<6500,`${kind}: ${triangles} triangles`);
  assert.ok(model.meshes.every(m=>!m.material.uniforms.paintMap.value));
  for(const mesh of model.meshes){mesh.geometry.dispose();mesh.material.dispose();}
 }
});

test('uncertain and unsupported recognition cannot produce an invented generic blob',()=>{
 assert.throws(()=>chooseObject([{className:'cheeseburger',probability:.03}],null));
 assert.throws(()=>chooseObject([{className:'oscilloscope',probability:.9}],null));
});

test('face evidence produces a person with face, torso and limb parts',()=>{
 const s=chooseObject([{className:'jersey',probability:.4}],{probability:.95,area:.12});
 const r=objectRecipe(s,{palette:[[123,176,208]],skin:[225,173,133],hair:[99,73,52]});
 assert.equal(s.kind,'person');for(const name of ['head','torso','arm','leg','hair'])assert.ok(r.parts.some(p=>p.name===name));
});
