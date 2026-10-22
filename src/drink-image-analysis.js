// Pixel measurements supplement the language model; they do not assign a semantic
// object class. The worker only uses these after recognizing a drinking vessel.
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function hsv(r,g,b){const max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=d===0?0:max===r?((g-b)/d+6)%6:max===g?(b-r)/d+2:(r-g)/d+4;return [h*60,max?d/max:0,max/255];}
const hex=rgb=>'#'+rgb.map(n=>Math.round(n).toString(16).padStart(2,'0')).join('');
function splitSkins(points,w,h,data){
 const light=points.filter(i=>data[i*4]>235&&data[i*4+1]>108),dark=points.filter(i=>data[i*4+1]<95);
 const center=ps=>[ps.reduce((s,i)=>s+i%w,0)/ps.length,ps.reduce((s,i)=>s+Math.floor(i/w),0)/ps.length];
 if(light.length>points.length*.12&&dark.length>points.length*.23){const a=center(light),b=center(dark);if(Math.hypot(a[0]-b[0],a[1]-b[1])>Math.sqrt(points.length)*.33){const groups=[[],[]];for(const i of points){const x=i%w,y=Math.floor(i/w);groups[(x-a[0])**2+(y-a[1])**2<(x-b[0])**2+(y-b[1])**2?0:1].push(i);}return groups;}}

 const d=new Float32Array(w*h),mask=new Set(points);for(const i of points)d[i]=w+h;
 for(const i of points.slice().sort((a,b)=>a-b))d[i]=Math.min(d[i],(i%w?d[i-1]:0)+1,(i>=w?d[i-w]:0)+1);
 for(const i of points.slice().sort((a,b)=>b-a))d[i]=Math.min(d[i],(i%w<w-1?d[i+1]:0)+1,(i+w<w*h?d[i+w]:0)+1);
 const ranked=points.slice().sort((a,b)=>d[b]-d[a]),max=d[ranked[0]],seeds=[];
 for(const i of ranked){if(d[i]<Math.max(5,max*.64))break;const x=i%w,y=Math.floor(i/w);if(seeds.every(k=>Math.hypot(x-k%w,y-Math.floor(k/w))>max*2.5))seeds.push(i);if(seeds.length===3)break;}
 if(seeds.length<2)return [points];
 const groups=seeds.map(()=>[]);for(const i of mask){let best=0,dist=Infinity;for(let k=0;k<seeds.length;k++){const dd=(i%w-seeds[k]%w)**2+(Math.floor(i/w)-Math.floor(seeds[k]/w))**2;if(dd<dist){dist=dd;best=k;}}groups[best].push(i);}
 return groups.every(g=>g.length>points.length*.18)?groups:[points];
}
export function analyzeDrinkPixels(data,width,height){
 const labels=new Uint8Array(width*height),pink=[],colored=[];
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const i=y*width+x,j=i*4,[r,g,b]=data.slice(j,j+3),[h,s,v]=hsv(r,g,b);
  if(x<width*.08||x>width*.92||y<height*.08||y>height*.91)continue;
  if(s>.18&&v>.28)colored.push(i);
  // Pale salmon liquid differs from the saturated red skins and citrus flesh.
  if(r>160&&g>95&&b>85&&r>g*1.20&&g>b*1.03&&s>.20&&s<.52)pink.push(i);
  labels[i]=s>.48&&v>.38&&r>g*1.4&&g<b*1.8&&(h<25||h>345)?1:s>.55&&v>.86&&h>=25&&h<48?2:s>.35&&v>.25&&((h>=28&&h<55&&v<.84)||(h>=48&&h<165))?3:v<.48&&s>.10&&b>=r*.77?4:0;
 }
 if(colored.length<width*height*.02)return {reliable:false,fruits:[]};
 const bounds=indices=>{let x0=width,y0=height,x1=0,y1=0;for(const i of indices){const x=i%width,y=Math.floor(i/width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);}return [x0,y0,x1-x0+1,y1-y0+1];};
 const rows=new Uint32Array(height);for(const i of pink)rows[Math.floor(i/width)]++;const rowThreshold=Math.max(...rows)*.30;
 let bodyStart=0;for(let y=0;y<height-7;y++)if(Array.from(rows.slice(y,y+8)).every(n=>n>=rowThreshold)){bodyStart=y;break;}
 const body=pink.filter(i=>Math.floor(i/width)>=bodyStart&&rows[Math.floor(i/width)]>=rowThreshold);
 const liquidBox=bounds(body.length>width*height*.02?body:colored),[lx,ly,lw,lh]=liquidBox;
 const vessel=[Math.max(0,lx-lw*.025),Math.max(0,ly-lh*.25),lw*1.05,lh*1.27];
 // Separate skins joined by a few tinted liquid pixels, without splitting
 // the actual large fruit volumes into isolated texture freckles.
 const original=labels.slice();for(let y=2;y<height-2;y++)for(let x=2;x<width-2;x++){const i=y*width+x;if(original[i]!==1)continue;for(const [dx,dy]of [[2,0],[-2,0],[0,2],[0,-2]])if(original[i+dy*width+dx]!==1){labels[i]=0;break;}}
 const seen=new Uint8Array(labels.length),fruits=[];
 for(let i=0;i<labels.length;i++)if(labels[i]&&!seen[i]){
  const label=labels[i],queue=[i],component=[];seen[i]=1;
  for(let q=0;q<queue.length;q++){const k=queue[q],x=k%width,y=Math.floor(k/width);component.push(k);for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,yy=y+dy,n=yy*width+xx;if(xx>=0&&xx<width&&yy>=0&&yy<height&&!seen[n]&&labels[n]===label){seen[n]=1;queue.push(n);}}}
  if(component.length<width*height*.0013)continue;
  const box=bounds(component),[x,y,w,h]=box,cx=x+w/2,cy=y+h/2;
  if(cx<lx||cx>lx+lw||cy<ly-lh*.08||cy>ly+lh||w>lw*.75||h>lh*.75)continue;
  // A dark shadow stripe or an entire green smoothie is not a round berry.
  if(label===1&&(w/h<.38||w/h>1.8))continue;
  if(label===4&&(w/h<.45||w/h>2||component.length/(w*h)<.35))continue;
  const regions=label===1&&w>lw*.35?splitSkins(component,width,height,data):[component];
  for(const region of regions){const b=bounds(region),rgb=[0,0,0];for(const k of region)for(let c=0;c<3;c++)rgb[c]+=data[k*4+c]/region.length;
   fruits.push({family:['','red','citrus','green','dark-berry'][label],box:b,color:hex(rgb),cut:label===1&&rgb[1]>100,area:region.length,center:[b[0]+b[2]/2,b[1]+b[3]/2]});
  }
 }
 // Red light transmitted through a kiwi/chunk must not become another strawberry.
 for(let i=fruits.length-1;i>=0;i--){const f=fruits[i];if(f.family==='red'&&fruits.some(g=>g.family==='green'&&f.center[0]>=g.box[0]&&f.center[0]<=g.box[0]+g.box[2]&&f.center[1]>=g.box[1]&&f.center[1]<=g.box[1]+g.box[3]))fruits.splice(i,1);}
 fruits.sort((a,b)=>b.area-a.area);fruits.splice(8);fruits.sort((a,b)=>a.center[1]-b.center[1]||a.center[0]-b.center[0]);
 const samples=pink.filter(i=>!labels[i]&&Math.floor(i/width)>=ly&&Math.floor(i/width)<ly+lh*.28),rgb=[0,0,0];for(const i of samples)for(let c=0;c<3;c++)rgb[c]+=data[i*4+c]/Math.max(1,samples.length);
 const families=new Set(fruits.map(f=>f.family));
 return {version:1,reliable:fruits.length>=2&&families.size>=2,vessel,liquidBox,liquidColor:samples.length?hex(rgb):null,fill:clamp(lh/vessel[3],.55,.94),fruits,width,height,crop:[lx,Math.max(0,ly-lh*.08),lw,lh*1.08],uncertainty:'Depth and occluded surfaces are design estimates from a single view.'};
}
