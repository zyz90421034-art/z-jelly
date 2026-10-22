import * as T from 'three';
import {modelPalette} from './background-palette.js';

// All cards use the actual part silhouettes with the same paper, paint and highlight rules.
// Convex silhouettes deliberately omit small mesh detail: the card is an illustration, not a screenshot.
function hull(points){
 const p=points.sort((a,b)=>a.x-b.x||a.y-b.y).filter((v,i,a)=>!i||Math.abs(v.x-a[i-1].x)+Math.abs(v.y-a[i-1].y)>.00001);
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),half=[];
 for(const v of p){while(half.length>1&&cross(half.at(-2),half.at(-1),v)<=0)half.pop();half.push(v);}
 const lower=half.length;for(let i=p.length-2;i>=0;i--){const v=p[i];while(half.length>lower&&cross(half.at(-2),half.at(-1),v)<=0)half.pop();half.push(v);}half.pop();return half;
}
function path(ctx,points){ctx.beginPath();for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];if(!i)ctx.moveTo((a.x+b.x)/2,(a.y+b.y)/2);const c=points[(i+2)%points.length];ctx.quadraticCurveTo(b.x,b.y,(b.x+c.x)/2,(b.y+c.y)/2);}ctx.closePath();}
export function studyThumbnail(root,palette){
 root.updateWorldMatrix(true,true);const bounds=new T.Box3().setFromObject(root),center=bounds.getCenter(new T.Vector3()),extent=bounds.getSize(new T.Vector3()).length();
 const camera=new T.OrthographicCamera(-1,1,1,-1,.001,100),aim=new T.Vector3(1.8,1.25,2.3).normalize();
 camera.position.copy(center).addScaledVector(aim,Math.max(extent*3,1));camera.lookAt(center);camera.updateMatrixWorld();
 const items=[],all=[],inverse=new T.Matrix4().copy(root.matrixWorld).invert();
 root.traverse(mesh=>{if(!mesh.isMesh)return;const position=mesh.geometry.attributes.position,points=[];
  const matrix=new T.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld),world=new T.Matrix4().multiplyMatrices(root.matrixWorld,matrix);
  const view=new T.Vector3();let depth=0;
  for(let i=0;i<position.count;i++){view.fromBufferAttribute(position,i).applyMatrix4(world).applyMatrix4(camera.matrixWorldInverse);depth+=view.z;points.push({x:view.x,y:-view.y});}
  const outline=hull(points);if(outline.length<3)return;all.push(...outline);
  const material=Array.isArray(mesh.material)?mesh.material[0]:mesh.material,u=material.uniforms;
  const color=u?.baseColor?.value?.clone()||material.color?.clone()||u?.tint?.value?.clone()||new T.Color('#e4b5cb');
  const vertexColor=mesh.geometry.attributes.color;if(vertexColor){const mean=new T.Color(0,0,0),sample=new T.Color();let count=0;for(let i=0;i<vertexColor.count;i+=Math.max(1,Math.floor(vertexColor.count/200))){sample.fromBufferAttribute(vertexColor,i);mean.add(sample);count++;}color.multiply(mean.multiplyScalar(1/count));}
  const role=mesh.userData.role||(u?.kind?.value===1?'glass':u?.kind?'liquid':'soft');
  items.push({outline,color,role,depth:depth/position.count});
 });
 if(!all.length)return '';
 const minX=Math.min(...all.map(p=>p.x)),maxX=Math.max(...all.map(p=>p.x)),minY=Math.min(...all.map(p=>p.y)),maxY=Math.max(...all.map(p=>p.y));
 const scale=Math.min(119/(maxX-minX),116/(maxY-minY));
 for(const item of items)for(const p of item.outline){p.x=80+(p.x-(minX+maxX)/2)*scale*1.04;p.y=83+(p.y-(minY+maxY)/2)*scale*.94;}
 const canvas=document.createElement('canvas');canvas.width=canvas.height=160;const ctx=canvas.getContext('2d'),theme=modelPalette(palette);
 const background=ctx.createRadialGradient(35,25,5,90,90,155);background.addColorStop(0,theme.cool.getStyle());background.addColorStop(1,theme.accent.getStyle());ctx.fillStyle=background;ctx.fillRect(0,0,160,160);
 ctx.fillStyle='rgba(140,119,160,.17)';ctx.beginPath();ctx.ellipse(82,137,43,6,0,0,Math.PI*2);ctx.fill();
 for(const item of items.sort((a,b)=>a.depth-b.depth)){
  const glass=item.role==='glass',color=item.color.clone().lerp(new T.Color('#fff0df'),.14),paint=ctx.createLinearGradient(35,38,125,138);
  paint.addColorStop(0,color.clone().lerp(new T.Color('#fff2df'),.27).getStyle());paint.addColorStop(1,color.getStyle());
  path(ctx,item.outline);ctx.fillStyle=paint;ctx.globalAlpha=glass?.18:.94;ctx.fill();ctx.globalAlpha=1;
  ctx.strokeStyle=glass?'rgba(255,246,229,.85)':color.clone().multiplyScalar(.88).getStyle();ctx.lineWidth=glass?1.6:.7;ctx.stroke();
  ctx.save();path(ctx,item.outline);ctx.clip();ctx.strokeStyle='rgba(255,246,231,.45)';ctx.lineCap='round';ctx.lineWidth=2.2;ctx.beginPath();const p=item.outline[0];ctx.moveTo(p.x+2,p.y+4);ctx.quadraticCurveTo(p.x+1,p.y+10,p.x+5,p.y+17);ctx.stroke();ctx.restore();
 }
 const pixels=ctx.getImageData(0,0,160,160);for(let i=0;i<pixels.data.length;i+=4){let seed=Math.imul((i>>>2)^713,1597334677);seed=(seed^(seed>>>16))>>>0;const grain=(seed/4294967296-.5)*15;for(let c=0;c<3;c++)pixels.data[i+c]+=grain;}ctx.putImageData(pixels,0,0);
 ctx.strokeStyle='#fff2db';ctx.lineWidth=1.3;for(const [x,y]of [[19,27],[140,117]]){ctx.beginPath();ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4);ctx.stroke();}
 return canvas.toDataURL('image/png');
}
