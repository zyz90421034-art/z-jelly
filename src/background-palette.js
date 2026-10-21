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
 const chosen=subjectColor(palette),hue=(chosen.h+(chosen.h<.5?.07:-.07)+1)%1;
 const lightness=chosen.l>.76?.64:.71;
 return {
  cool:new T.Color().setHSL(hue,T.MathUtils.clamp(chosen.s*.85,.60,.76),lightness,T.SRGBColorSpace),
  accent:new T.Color().setHSL((hue+.92)%1,T.MathUtils.clamp(chosen.s*.9,.62,.78),lightness+.025,T.SRGBColorSpace),
 };
}
