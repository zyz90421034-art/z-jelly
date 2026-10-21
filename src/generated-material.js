import * as T from 'three';
import {subjectColor} from './background-palette.js';

// The generated mesh stays three dimensional; this changes its illustration material.
export function jellyIllustrationMaterial(original,geometry){
 const hasColor=!!geometry.attributes.color,hasMap=!!original?.map&&!!geometry.attributes.uv;
 return new T.ShaderMaterial({vertexColors:hasColor,defines:hasMap?{PAINT_MAP:1}:{},uniforms:{backdrop:{value:null},paintMap:{value:original?.map||null},baseColor:{value:original?.color?.clone()||new T.Color('#fff1db')},resolution:{value:new T.Vector2(1,1)}},vertexShader:`
 varying vec3 vWorld;varying vec3 vNormal;varying vec3 vPaint;varying vec2 vPaintUv;
 void main(){vWorld=(modelMatrix*vec4(position,1.)).xyz;vNormal=normalize(mat3(modelMatrix)*normal);vPaint=vec3(1.);
 #ifdef USE_COLOR
 vPaint=color.rgb;
 #endif
 vPaintUv=vec2(0.);
 #ifdef PAINT_MAP
 vPaintUv=uv;
 #endif
 gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`,fragmentShader:`
 uniform sampler2D backdrop;uniform sampler2D paintMap;uniform vec3 baseColor;uniform vec2 resolution;
 varying vec3 vWorld;varying vec3 vNormal;varying vec3 vPaint;varying vec2 vPaintUv;
 void main(){vec3 n=normalize(vNormal),view=normalize(cameraPosition-vWorld);if(dot(n,view)<0.)n=-n;
 float facing=clamp(dot(n,view),0.,1.),rim=pow(1.-facing,2.2);
 vec3 paint=baseColor*vPaint;
 #ifdef PAINT_MAP
 paint*=texture2D(paintMap,vPaintUv).rgb;
 #endif
 paint=pow(max(paint,vec3(.012)),vec3(.96));
 float luminance=dot(paint,vec3(.2126,.7152,.0722));paint=mix(vec3(luminance),paint,1.18);
 paint=mix(paint,floor(clamp(paint,0.,1.)*9.+.5)/9.,.42);
 float light=dot(n,normalize(vec3(-.45,.85,.5)))*.5+.5;light=mix(.72,1.04,smoothstep(.18,.88,light));
 vec3 body=paint*light;vec3 nv=normalize(mat3(viewMatrix)*n);vec2 uv=gl_FragCoord.xy/resolution;
 // Composite refraction explicitly: alpha blending would lose colour at overlaps.
 float thickness=sqrt(facing);
 vec2 bend=nv.xy*(.012+.022*thickness);
 vec3 transmitted=texture2D(backdrop,clamp(uv+bend,vec2(.002),vec2(.998))).rgb;
 vec3 absorption=mix(vec3(1.),mix(paint,vec3(1.),.28),.24+.20*thickness);
 transmitted*=absorption;
 float density=.58+.10*thickness+.15*rim;
 vec3 color=mix(transmitted,body,density);
 color+=mix(paint,vec3(1.,.94,.86),.70)*rim*.22;
 vec3 h=normalize(view+normalize(vec3(-.45,.85,.5)));color+=vec3(1.,.95,.86)*pow(max(dot(n,h),0.),64.)*.25;
 gl_FragColor=vec4(color,1.);}`});
}

export function stylizeVertexColors(geometry,palette){
 const color=geometry.attributes.color;if(!color)return;
 const k=7,centers=[];
 for(let j=0;j<k;j++){const i=Math.min(color.count-1,Math.floor(color.count*(j+.5)/k));centers.push([color.getX(i),color.getY(i),color.getZ(i)]);}
 const nearest=(r,g,b)=>{let best=0,distance=Infinity;for(let j=0;j<k;j++){const c=centers[j],d=(r-c[0])**2+(g-c[1])**2+(b-c[2])**2;if(d<distance){distance=d;best=j;}}return best;};
 const stride=Math.max(1,Math.floor(color.count/5000));
 for(let iteration=0;iteration<5;iteration++){const sums=Array.from({length:k},()=>[0,0,0,0]);for(let i=0;i<color.count;i+=stride){const r=color.getX(i),g=color.getY(i),b=color.getZ(i),sum=sums[nearest(r,g,b)];sum[0]+=r;sum[1]+=g;sum[2]+=b;sum[3]++;}for(let j=0;j<k;j++)if(sums[j][3])centers[j]=sums[j].slice(0,3).map(v=>v/sums[j][3]);}
 const subject=subjectColor(palette);
 const painted=centers.map(c=>{const value=new T.Color(...c),hsl={};value.getHSL(hsl,T.SRGBColorSpace);if(hsl.s<.22){hsl.h=subject.h;hsl.s=hsl.l>.65?.24:.32;}value.setHSL(hsl.h,T.MathUtils.clamp(hsl.s*.92,.24,.72),T.MathUtils.clamp(hsl.l*.83+.09,.25,.87),T.SRGBColorSpace);return value;});
 for(let i=0;i<color.count;i++){const c=painted[nearest(color.getX(i),color.getY(i),color.getZ(i))];color.setXYZ(i,c.r,c.g,c.b);}color.needsUpdate=true;
}

export function softenGeometry(geometry){
 const p=geometry.attributes.position,index=geometry.index;
 if(!index||p.count>180000)return;
 const neighbors=Array.from({length:p.count},()=>new Set());
 for(let i=0;i<index.count;i+=3){const a=index.getX(i),b=index.getX(i+1),c=index.getX(i+2);neighbors[a].add(b).add(c);neighbors[b].add(a).add(c);neighbors[c].add(a).add(b);}
 // A small Taubin pass softens scanned detail without heavily shrinking the outline.
 const next=new Float32Array(p.array.length);
 for(const strength of [.27,-.28,.27,-.28]){for(let i=0;i<p.count;i++){let x=0,y=0,z=0;for(const j of neighbors[i]){x+=p.getX(j);y+=p.getY(j);z+=p.getZ(j);}const n=neighbors[i].size;next[i*3]=p.getX(i)+(n?x/n-p.getX(i):0)*strength;next[i*3+1]=p.getY(i)+(n?y/n-p.getY(i):0)*strength;next[i*3+2]=p.getZ(i)+(n?z/n-p.getZ(i):0)*strength;}p.array.set(next);}
 p.needsUpdate=true;geometry.computeVertexNormals();
}
