import * as T from 'three';

// Choose pigment in display color space; linear HSL made pastel colors nearly white.
export function subjectColor(palette){
 const candidates=(palette||[]).map(rgb=>{
  const color=new T.Color(`rgb(${rgb.join(',')})`),hsl={};color.getHSL(hsl,T.SRGBColorSpace);
  return {...hsl,brightness:Math.max(...rgb)/255};
 }).filter(c=>c.s>.26&&c.brightness>.48&&c.l>.18&&c.l<.86);
 candidates.sort((a,b)=>(b.s*Math.sqrt(b.brightness))-(a.s*Math.sqrt(a.brightness)));
 return candidates[0]||{h:.55,s:.65,l:.5};
}

function lab(c){
 const l=Math.cbrt(.4122214708*c.r+.5363325363*c.g+.0514459929*c.b),m=Math.cbrt(.2119034982*c.r+.6806995451*c.g+.1073969566*c.b),s=Math.cbrt(.0883024619*c.r+.2817188376*c.g+.6299787005*c.b);
 return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];
}
function separation(a,b){const x=lab(a),y=lab(b);return Math.hypot(...x.map((n,i)=>n-y[i]));}
function coloredBackdrop(palette,blueprint){
 const liquids=(blueprint.parts||[]).filter(p=>['clear-liquid','liquid'].includes(p.role)).sort((a,b)=>b.size.reduce((n,v)=>n*v,1)-a.size.reduce((n,v)=>n*v,1));
 let source;if(liquids[0])source=new T.Color(liquids[0].color);else{const chosen=subjectColor(palette);source=new T.Color().setHSL(chosen.h,chosen.s,chosen.l,T.SRGBColorSpace);}
 const hsl={};source.getHSL(hsl,T.SRGBColorSpace);
 // Select a related cooler hue, rather than letting a saturated piece of fruit
 // choose a background that disappears into the liquid. Keep the background
 // pastel, with restrained chroma and an explicit foreground separation score.
 const direction=hsl.h<.17||hsl.h>.78?-1:1;
 const pale=hsl.l>.90||hsl.s<.14&&hsl.l>.84;
 const predicted=bg=>{
  if(!liquids.length)return source;
  if(liquids[0].role!=='clear-liquid')return source.clone().multiplyScalar(.9);
  const out=source.clone();for(const ch of ['r','g','b'])out[ch]=bg[ch]*Math.pow(source[ch]*.9+.1,.935)*.79+source[ch]*.21;return out;
 };
 let best=null;
 for(const spread of [.18,.20])for(const light of (pale?[.73,.77]:[.82,.85,.88])){
  const cool=new T.Color().setHSL((hsl.h+direction*spread+1)%1,.50,light,T.SRGBColorSpace);
  const accent=new T.Color().setHSL((hsl.h+direction*.09+1)%1,.48,light-.035,T.SRGBColorSpace);
  const stops=[cool,cool.clone().lerp(accent,.5),accent];
  const contrast=Math.min(...stops.map(bg=>separation(bg,predicted(bg))));
  // Prefer a light colored wash; use the paler option only when needed for
  // separation. Penalize excessive near-white washout and distant hue shifts.
  const score=Math.min(contrast,.135)-(light>.85?.012:0)-(spread>.18?.002:0);
  if(!best||score>best.score)best={cool,accent,score};
 }
 return {cool:best.cool,accent:best.accent};
}

export function modelPalette(palette,blueprint=null){
 if(blueprint?.parts?.length)return coloredBackdrop(palette,blueprint);
 const chosen=subjectColor(palette);
 // Keep both pigments near the subject; use lightness to separate the silhouette.
 const coolHue=(chosen.h+.055)%1,accentHue=(chosen.h+.945)%1;
 const lightness=chosen.l>.76?.64:.78;
 return {
  cool:new T.Color().setHSL(coolHue,T.MathUtils.clamp(chosen.s*.65,.42,.58),lightness,T.SRGBColorSpace),
  accent:new T.Color().setHSL(accentHue,T.MathUtils.clamp(chosen.s*.82,.54,.68),lightness+(chosen.l>.76?.09:-.09),T.SRGBColorSpace),
 };
}
