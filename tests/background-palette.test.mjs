import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {modelPalette} from '../src/background-palette.js';
const recipe=color=>({parts:[{name:'drink',role:'clear-liquid',color,size:[1,1,1]}]});
const hsl=color=>color.getHSL({},T.SRGBColorSpace);
const hueGap=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
test('liquid drives the generated background even when the fruit palette changes',()=>{
 const a=modelPalette([[255,170,0],[240,45,70]],recipe('#f7bba4')),b=modelPalette([[80,180,40],[60,70,180]],recipe('#f7bba4'));
 assert.equal(a.cool.getHexString(),b.cool.getHexString());assert.equal(a.accent.getHexString(),b.accent.getHexString());
});
test('colored drinks get restrained related pigments separated from their liquid hue',()=>{
 for(const hex of ['#f7bba4','#df6e95','#b9d971','#73b6da','#603b2d']){
  const theme=modelPalette([],recipe(hex)),liquid=hsl(new T.Color(hex));
  for(const pigment of [theme.cool,theme.accent]){const bg=hsl(pigment);assert.ok(bg.s>=.40&&bg.s<=.55);assert.ok(bg.l>=.78);assert.ok(hueGap(bg.h,liquid.h)>.05&&hueGap(bg.h,liquid.h)<=.201);}
 }
});
test('very pale milk gets a slightly deeper colored wash instead of a near-white background',()=>{
 const theme=modelPalette([],recipe('#fff9ed'));assert.ok(hsl(theme.cool).l<.81);assert.ok(hsl(theme.accent).s>.3);
});
test('legacy artwork retains its existing palette without a generated blueprint',()=>{
 const theme=modelPalette([[120,190,38],[255,180,24]]);assert.equal(theme.cool.getHexString(),'e7e7a6');assert.equal(theme.accent.getHexString(),'e69f7a');
});
