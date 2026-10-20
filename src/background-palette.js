import * as T from 'three';

// Choose pigment in display color space; linear HSL made pastel colors nearly white.
export function modelPalette(palette){
 const candidates=(palette||[]).map(rgb=>{
  const color=new T.Color(`rgb(${rgb.join(',')})`),hsl={};color.getHSL(hsl,T.SRGBColorSpace);
  return {...hsl,brightness:Math.max(...rgb)/255};
 }).filter(c=>c.s>.26&&c.brightness>.48&&c.l>.18&&c.l<.86);
 candidates.sort((a,b)=>(b.s*Math.sqrt(b.brightness))-(a.s*Math.sqrt(a.brightness)));
 const chosen=candidates[0]||{h:.55,s:.65};
 return {
  cool:new T.Color().setHSL((chosen.h+.035)%1,T.MathUtils.clamp(chosen.s*.85,.52,.70),.77,T.SRGBColorSpace),
  accent:new T.Color().setHSL((chosen.h+.92)%1,T.MathUtils.clamp(chosen.s*.9,.56,.74),.81,T.SRGBColorSpace),
 };
}
