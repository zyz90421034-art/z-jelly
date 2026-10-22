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
// Independent art-directed color washes. Model colors only rank their contrast;
// they never become the backdrop pigments themselves.
export const BACKGROUND_PALETTES=Object.freeze([
 ['sky','#b6d9ed','#c6bee5'],
 ['mint','#b2ddd6','#c0d8ed'],
 ['lilac','#c4bae5','#e1c6dc'],
 ['rose','#edc3d2','#eed7c0'],
 ['cream','#efdab5','#edc5b5'],
 ['sage','#d3dfb5','#b6d9cc'],
 ['blue-depth','#86abc8','#ad9bd3'],
]);
function coloredBackdrop(palette,blueprint){
 const parts=blueprint.parts||[],area=p=>{const axes=p.size.slice().sort((a,b)=>b-a);return axes[0]*axes[1];};
 const liquids=parts.filter(p=>['clear-liquid','liquid'].includes(p.role)).sort((a,b)=>area(b)-area(a));
 let source;if(liquids[0])source=new T.Color(liquids[0].color);else{const chosen=subjectColor(palette);source=new T.Color().setHSL(chosen.h,chosen.s,chosen.l,T.SRGBColorSpace);}
 const solid=parts.filter(p=>p.fruitType||['soft','ceramic'].includes(p.role)).sort((a,b)=>area(b)-area(a)).slice(0,6);
 const total=solid.reduce((sum,p)=>sum+area(p),0);
 const pigments=solid.map(p=>({color:new T.Color(p.color),weight:area(p)/total}));
 const predicted=bg=>{
  if(!liquids.length)return source;
  if(liquids[0].role!=='clear-liquid')return source.clone().multiplyScalar(.9);
  const out=source.clone();for(const ch of ['r','g','b'])out[ch]=bg[ch]*Math.pow(source[ch]*.9+.1,.935)*.79+source[ch]*.21;return out;
 };
 const original=lab(source),originalChroma=Math.hypot(original[1],original[2]);
 let best=null;
 for(const [id,a,b]of BACKGROUND_PALETTES){
  const cool=new T.Color(a),accent=new T.Color(b),stops=[cool,cool.clone().lerp(accent,.5),accent];
  const visibleContrast=Math.min(...stops.map(bg=>separation(bg,predicted(bg))));
  const bodyContrast=pigments.length?pigments.reduce((sum,p)=>sum+p.weight*Math.min(...stops.map(bg=>separation(bg,p.color))),0):Math.min(...stops.map(bg=>separation(bg,source)));
  const center=cool.clone().lerp(accent,.5),foreground=lab(predicted(center)),background=lab(center);
  const foregroundChroma=Math.hypot(foreground[1],foreground[2]);
  const hueDifference=originalChroma>.025?Math.acos(T.MathUtils.clamp((original[1]*background[1]+original[2]*background[2])/(originalChroma*Math.max(.001,Math.hypot(background[1],background[2]))),-1,1))/Math.PI:0;
  const colorLoss=originalChroma>.04&&foregroundChroma<originalChroma*.38?.025:0;
  // Contrast and hue separation matter more than matching the subject. Reserve
  // the deeper wash for near-white subjects; normal subjects keep a light stage.
  const score=visibleContrast*.64+bodyContrast*.36+hueDifference*.055-colorLoss-(id==='blue-depth'?.025:0);
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
