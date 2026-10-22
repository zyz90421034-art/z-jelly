import test from 'node:test';import assert from 'node:assert/strict';
import {identifySubject,buildModelingPrompt,compileModelingPrompt} from '../src/prompt-modeler.js';
import {primitiveStudy} from '../src/semantic-recipes.js';import * as T from 'three';
const palette=[[203,139,71],[116,179,86]];
test('color adjectives do not override the recognized subject',()=>{
 assert.equal(identifySubject('an orange cat').kind,'animal');
 assert.equal(identifySubject('an orange camera').kind,'camera');
 assert.equal(identifySubject('a woman').kind,'person');
 assert.throws(()=>identifySubject('a pinwheel'));
});
test('the generated modeling prompt compiles into distinct volumetric object parts',()=>{
 for(const [name,description] of [['hamburger','A bun, lettuce, cheese and tomato.'],['horse','A brown horse standing on four white legs.'],['coffee mug','A blue coffee mug with a round handle.']]){
  const prompt=buildModelingPrompt(name,description,palette),recipe=compileModelingPrompt(prompt);
  assert.equal(recipe.description,description);assert.equal(recipe.modelingPrompt,prompt);assert.ok(recipe.parts.length>=4);
  const study=primitiveStudy(recipe),bounds=new T.Box3().setFromObject(study.root);assert.ok(Number.isFinite(bounds.max.y));assert.ok(Math.abs(bounds.min.y)<1e-6);
  if(name==='horse')assert.equal(recipe.parts.filter(p=>p.name==='leg').length,4);
  if(name==='coffee mug')assert.ok(recipe.parts.some(p=>p.name==='vessel'&&p.type==='lathe'));
  for(const mesh of study.meshes){mesh.geometry.dispose();mesh.material.dispose();}
 }
});
test('invalid prompts cannot allocate geometry or inject executable instructions',()=>{
 assert.throws(()=>compileModelingPrompt('fetch("/api")'));
 assert.throws(()=>compileModelingPrompt(buildModelingPrompt('horse','A horse.',[[Infinity,0,0]])));
});
test('visible details in the generated prompt change the part assembly',()=>{
 const build=(name,description)=>compileModelingPrompt(buildModelingPrompt(name,description,palette));
 assert.ok(!build('hamburger','A bun and patty.').parts.some(p=>p.name==='onion'));
 assert.ok(build('hamburger','A burger with onion rings and pickles.').parts.some(p=>p.name==='onion'));
 assert.ok(build('a woman','A woman wearing a blue hat and glasses.').parts.some(p=>p.name==='hat'));
});
