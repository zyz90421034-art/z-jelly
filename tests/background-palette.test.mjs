import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {modelPalette,BACKGROUND_PALETTES} from '../src/background-palette.js';
const recipe=color=>({parts:[{name:'drink',role:'clear-liquid',color,size:[1,1,1]}]});
const hsl=color=>color.getHSL({},T.SRGBColorSpace);
const hueGap=(a,b)=>Math.min(Math.abs(a-b),1-Math.abs(a-b));
test('liquid drives the generated background even when the fruit palette changes',()=>{
 const a=modelPalette([[255,170,0],[240,45,70]],recipe('#f7bba4')),b=modelPalette([[80,180,40],[60,70,180]],recipe('#f7bba4'));
 assert.equal(a.cool.getHexString(),b.cool.getHexString());assert.equal(a.accent.getHexString(),b.accent.getHexString());
});
test('generated backdrops come from independent art-directed palettes, with no analogous hue restriction',()=>{
 for(const hex of ['#f7bba4','#df6e95','#b9d971','#73b6da','#603b2d']){
  const theme=modelPalette([],recipe(hex));
  assert.ok(BACKGROUND_PALETTES.some(([,a,b])=>theme.cool.getHexString()===a.slice(1)&&theme.accent.getHexString()===b.slice(1)));
 }
 const warm=modelPalette([],recipe('#f7bba4')),blue=modelPalette([],recipe('#73b6da'));
 assert.notEqual(warm.cool.getHexString(),blue.cool.getHexString());
 assert.ok(hueGap(hsl(warm.cool).h,hsl(new T.Color('#f7bba4')).h)>.25);
});
test('very pale milk gets a slightly deeper colored wash instead of a near-white background',()=>{
 const theme=modelPalette([],recipe('#fff9ed'));assert.ok(hsl(theme.cool).l<.81);assert.ok(hsl(theme.accent).s>.3);
});
test('legacy artwork retains its existing palette without a generated blueprint',()=>{
 const theme=modelPalette([[120,190,38],[255,180,24]]);assert.equal(theme.cool.getHexString(),'e7e7a6');assert.equal(theme.accent.getHexString(),'e69f7a');
});
