import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeDrinkPixels} from '../src/drink-image-analysis.js';
import {buildFoodBlueprint} from '../src/food-blueprint.js';
import {primitiveStudy} from '../src/semantic-recipes.js';
const palette=[[244,175,165],[232,155,80]];
test('fruit drink contents do not use brown coffee or a ring of surface toppings',()=>{
 const r=buildFoodBlueprint('a glass','A tall clear glass with pink juice, strawberry pieces, kiwi, orange slices and a blueberry.',palette);
 assert.equal(r.kind,'fruit-drink');assert.equal(r.parts.find(p=>p.name==='drink').color,'#f4a59e');
 const fruit=r.parts.filter(p=>p.fruitType);assert.equal(fruit.length,4);assert.equal(new Set(fruit.map(p=>p.fruitType)).size,4);
 assert.ok(fruit.every(p=>p.insideLiquid));assert.ok(!r.parts.some(p=>/leaf|foam|handle/.test(p.name)));
 assert.ok(new Set(fruit.map(p=>p.position[1])).size>1);
 const model=primitiveStudy(r);
 for(const mesh of model.meshes){const p=mesh.userData.sourcePart;assert.ok(mesh.layers.isEnabled(p.insideLiquid?0:['glass','clear-glass'].includes(p.role)?2:1));mesh.geometry.computeBoundingBox();assert.ok(Number.isFinite(mesh.geometry.boundingBox.min.x));}
});
test('multicolor interior evidence can correct a generic coffee caption but leaves plain coffee alone',()=>{
 const evidence={reliable:true,vessel:[10,10,80,130],fill:.82,liquidColor:'#f5b0ad',fruits:[{family:'red',color:'#e85a64',box:[20,40,22,28],center:[31,54]},{family:'green',color:'#bbd176',box:[52,70,24,26],center:[64,83]}]};
 const r=buildFoodBlueprint('a cup','A clear cup with a beverage.',palette,{drink:evidence});
 assert.equal(r.kind,'fruit-drink');assert.equal(r.parts.find(p=>p.name==='drink').color,evidence.liquidColor);
 assert.ok(r.parts.find(p=>p.name==='fruit-0').position[1]>r.parts.find(p=>p.name==='fruit-1').position[1]);
 assert.equal(buildFoodBlueprint('coffee','A brown coffee with white foam.',palette,{drink:{reliable:false,fruits:[]}}).kind,'coffee-cup');
});
test('pixel evidence measures multiple colored interior regions and rejects a plain brown drink',()=>{
 const w=128,h=160,data=new Uint8ClampedArray(w*h*4).fill(255);
 const box=(x,y,bw,bh,rgb)=>{for(let yy=y;yy<y+bh;yy++)for(let xx=x;xx<x+bw;xx++)data.set([...rgb,255],(yy*w+xx)*4);};
 box(30,40,70,100,[244,182,165]);box(36,59,18,22,[218,59,65]);box(69,95,20,22,[160,174,80]);
 const e=analyzeDrinkPixels(data,w,h);assert.ok(e.reliable);assert.ok(e.fruits.some(f=>f.family==='red'));assert.ok(e.fruits.some(f=>f.family==='green'));
 box(30,40,70,100,[176,115,69]);assert.equal(analyzeDrinkPixels(data,w,h).reliable,false);
});
test('fruit bodies retain volume when viewed from the side, with local details following rotations',()=>{
 const r=buildFoodBlueprint('glass','A clear glass of pink strawberry juice, kiwi, orange slices and blueberries.',palette);
 for(const p of r.parts.filter(p=>p.fruitType)){
  if(p.type==='berry'||p.type==='berry-half'||p.type==='blueberry')assert.ok(p.size[2]>=p.size[0]*.8,p.name+' must have a curved back');
  if(p.type==='cylinder')assert.ok(p.size[1]>=Math.max(p.size[0],p.size[2])*.28,p.name+' must have thickness');
  assert.ok(p.rotation.some(n=>Math.abs(n)>.05));
 }
 assert.ok(r.parts.filter(p=>p.name.includes('seed')).every(p=>p.insideLiquid));
});
