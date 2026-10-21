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

export function modelPalette(palette){
 const chosen=subjectColor(palette);
 // Split complementary pigments separate the backdrop from translucent subjects.
 const coolHue=(chosen.h+.38)%1,accentHue=(chosen.h+.62)%1;
 const lightness=chosen.l>.76?.65:.76;
 return {
  cool:new T.Color().setHSL(coolHue,T.MathUtils.clamp(chosen.s*.75,.50,.64),lightness,T.SRGBColorSpace),
  accent:new T.Color().setHSL(accentHue,T.MathUtils.clamp(chosen.s*.85,.56,.70),lightness+(chosen.l>.76?.08:-.07),T.SRGBColorSpace),
 };
}
