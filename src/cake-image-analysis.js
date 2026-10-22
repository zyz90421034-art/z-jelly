// Pixel measurements complement the small VLM. No image hash or example-specific layout.
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function components(mask,w,h,minArea=12){
 const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length),out=[];
 for(let start=0;start<mask.length;start++){
  if(!mask[start]||seen[start])continue;let head=0,tail=1,area=0,x0=w,y0=h,x1=0,y1=0,sx=0,sy=0;queue[0]=start;seen[start]=1;
  while(head<tail){const i=queue[head++],x=i%w,y=(i/w)|0;area++;sx+=x;sy+=y;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
   for(const j of [x?i-1:-1,x<w-1?i+1:-1,y?i-w:-1,y<h-1?i+w:-1])if(j>=0&&mask[j]&&!seen[j]){seen[j]=1;queue[tail++]=j;}
  }
  if(area>=minArea)out.push({area,bounds:[x0,y0,x1-x0+1,y1-y0+1],center:[sx/area,sy/area]});
 }
 return out.sort((a,b)=>b.area-a.area);
}
function close(mask,w,h){
 const dilated=new Uint8Array(mask.length),out=new Uint8Array(mask.length);
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;let any=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)any|=mask[i+dy*w+dx];dilated[i]=any;}
 for(let y=1;y<h-1;y++)for(let x=1;x<w-1;x++){const i=y*w+x;let all=1;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)all&=dilated[i+dy*w+dx];out[i]=all;}
 return out;
}
function colorOf(data,w,box,channels=4,mask=null){
 const colors=[];const [x,y,bw,bh]=box;
 for(let j=Math.max(0,y|0);j<Math.min(data.length/channels/w,y+bh);j+=2)for(let i=Math.max(0,x|0);i<Math.min(w,x+bw);i+=2){if(mask&&!mask[j*w+i])continue;const p=(j*w+i)*channels;colors.push([data[p],data[p+1],data[p+2]]);}
 if(!colors.length)return [220,180,160];return [0,1,2].map(c=>colors.map(v=>v[c]).sort((a,b)=>a-b)[colors.length>>1]);
}
export function analyzeCakePixels(data,w,h,{channels=4}={}){
 const n=w*h,crumb=new Uint8Array(n),pink=new Uint8Array(n),red=new Uint8Array(n),dark=new Uint8Array(n),green=new Uint8Array(n);
 for(let i=0;i<n;i++){const p=i*channels,r=data[p],g=data[p+1],b=data[p+2];if(channels===4&&data[p+3]<180)continue;
  crumb[i]=r>145&&g>100&&r-g<75&&r-g>3&&g-b>28&&g-b>(r-g)*.8&&r-b>60?1:0;
  pink[i]=r>165&&g>105&&r-g>12&&r-b>8&&g-b<35&&r-g<80?1:0;
  red[i]=r>110&&r-g>60&&r-b>45&&g<r*.72&&g<b*1.7?1:0;
  dark[i]=r<130&&g<140&&b<155&&b>r*.90&&b>g*.95&&Math.max(r,g,b)-Math.min(r,g,b)<65?1:0;
  green[i]=g>r*1.04&&g>b*1.18&&g>45&&r<195?1:0;
 }
 const crumbRegions=components(close(crumb,w,h),w,h,Math.max(30,n*.0008));
 const widest=Math.max(0,...crumbRegions.map(c=>c.bounds[2]));
 const candidates=crumbRegions.filter(c=>c.bounds[2]>widest*.42&&c.bounds[3]>h*.015&&c.center[1]>h*.25&&c.bounds[2]>w*.12&&c.bounds[2]<w*.88);
 const bands=candidates.sort((a,b)=>a.center[1]-b.center[1]).slice(0,6);
 // Rows from the same physical sponge band may fragment around pores; merge overlaps.
 const layers=[];for(const c of bands){const previous=layers.at(-1);if(previous&&c.bounds[1]<previous.bounds[1]+previous.bounds[3]*.60){const a=previous.bounds,b=c.bounds;previous.bounds=[Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.max(a[0]+a[2],b[0]+b[2])-Math.min(a[0],b[0]),Math.max(a[1]+a[3],b[1]+b[3])-Math.min(a[1],b[1])];previous.area+=c.area;}else layers.push({...c});}
 const reliable=layers.length>=1&&layers.length<=5&&layers.every(c=>c.area>n*.0015)&&layers.length===candidates.length;
 if(!layers.length)return {version:1,reliable:false,layers:[],fruits:[],reason:'No separated warm sponge bands found.'};
 const body=[Math.min(...layers.map(c=>c.bounds[0])),Math.min(...layers.map(c=>c.bounds[1])),0,0];
 body[2]=Math.max(...layers.map(c=>c.bounds[0]+c.bounds[2]))-body[0];body[3]=Math.max(...layers.map(c=>c.bounds[1]+c.bounds[3]))-body[1];
 const profiles=[];
 for(let k=0;k<9;k++){const x=Math.round(body[0]+body[2]*(.12+k*.055)),runs=[];let start=-1;
  for(let y=body[1];y<=body[1]+body[3];y++){let sum=0;for(let dy=-2;dy<=2;dy++)if(y+dy>=0&&y+dy<h)sum+=crumb[(y+dy)*w+x];const on=y<body[1]+body[3]&&sum>=3;
   if(on&&start<0)start=y;if(!on&&start>=0){if(y-start>body[3]*.045)runs.push({start,end:y});start=-1;}}
  if(runs.length===layers.length)profiles.push(runs);
 }
 const median=values=>values.sort((a,b)=>a-b)[values.length>>1];
 // Only search above the cake cut face; jam inside the cake must not become a fruit.
 const topLimit=body[1]+body[3]*.06,topMasks=[red,dark,green].map(mask=>mask.map((v,i)=>v&&(i/w|0)<topLimit&&(i%w)>body[0]-body[2]*.12&&(i%w)<body[0]+body[2]*1.20?1:0));
 const fruitRegions=components(close(topMasks[0],w,h),w,h,Math.max(20,n*.0003));
 const fruits=[];
 for(const region of fruitRegions){
  const [x,y,bw,bh]=region.bounds;if(bw>body[2]*.95||bh>body[3]*.8||bw<body[2]*.07||bh<body[3]*.1||bw/bh>2)continue;
  // Distinct color peaks in a touching berry cluster split cut pink flesh from a dark red whole berry.
  const bins=Array.from({length:bw},()=>({count:0,light:0}));
  for(let yy=y;yy<y+bh;yy++)for(let xx=x;xx<x+bw;xx++){const i=yy*w+xx,p=i*channels;if(!red[i])continue;bins[xx-x].count++;if(data[p+1]>95)bins[xx-x].light++;}
  const sections=[];let start=0,wasLight=null;for(let xx=0;xx<bw;xx++){const from=Math.max(0,xx-3),to=Math.min(bw,xx+4);let a=0,b=0;for(let k=from;k<to;k++){a+=bins[k].light;b+=bins[k].count;}const light=b>0&&a/b>.48;if(wasLight!==null&&light!==wasLight&&xx-start>bw*.22){sections.push([start,xx,wasLight]);start=xx;}wasLight=light;}
  sections.push([start,bw,wasLight]);
  const split=bw/bh>1.3&&sections.length===2&&sections.every(([a,b])=>b-a>bw*.25)?sections:[[0,bw,null]];
  for(const [a,b,isCut]of split){const bounds=[x+a,y,b-a,bh],rgb=colorOf(data,w,bounds,channels);const cut=isCut??(rgb[1]>100&&rgb[0]-rgb[1]<145);fruits.push({type:'strawberry',cut:!!cut,bounds,center:[x+(a+b)/2,region.center[1]],color:rgb,confidence:split.length===2?.78:.67});}
 }
 const darkRegions=components(close(topMasks[1],w,h),w,h,Math.max(20,n*.00025));
 for(const c of darkRegions){const [x,y,bw,bh]=c.bounds;if(bw<body[2]*.07||bw>body[2]*.32||bh>body[3]*.38||bw/bh<.55||bw/bh>1.6)continue;
  // Shadows beneath red fruit are not additional blueberries.
  if(fruits.some(f=>Math.abs(f.center[0]-c.center[0])<f.bounds[2]*.35&&Math.abs(f.center[1]-c.center[1])<f.bounds[3]*.30))continue;
  fruits.push({type:'blueberry',cut:false,...c,color:colorOf(data,w,c.bounds,channels),confidence:.72});
 }
 const leaves=components(close(topMasks[2],w,h),w,h,Math.max(12,n*.00012)).filter(c=>c.bounds[2]>body[2]*.04);
 const pinkRegions=components(close(pink,w,h),w,h,Math.max(50,n*.001));
 const frosting=pinkRegions.filter(c=>c.bounds[0]<body[0]+body[2]&&c.bounds[0]+c.bounds[2]>body[0]&&c.bounds[1]<body[1]+body[3]);
 const sideRegion=frosting.find(c=>c.bounds[0]+c.bounds[2]>body[0]+body[2]*.88&&c.bounds[3]>body[3]*.45);
 const gaps=layers.slice(0,-1).map((l,i)=>{const next=layers[i+1],y=profiles.length?median(profiles.map(p=>p[i].end)):l.bounds[1]+l.bounds[3],gap=profiles.length?median(profiles.map(p=>p[i+1].start-p[i].end)):next.bounds[1]-y;return {bounds:[body[0]+body[2]*.12,y,body[2]*.30,Math.max(2,gap)],height:Math.max(2,gap)};});
 const layerData=layers.map((l,i)=>({bounds:l.bounds,height:profiles.length?median(profiles.map(p=>p[i].end-p[i].start)):l.bounds[3],color:colorOf(data,w,l.bounds,channels,crumb)}));
 const creamColor=frosting.length?colorOf(data,w,frosting[0].bounds,channels,pink):null;
 const frame=[Math.max(body[0]-body[2]*.20,Math.min(body[0],...frosting.map(c=>c.bounds[0]))),body[1],0,body[3]];frame[2]=Math.min(body[0]+body[2]*1.45,Math.max(body[0]+body[2],...frosting.map(c=>c.bounds[0]+c.bounds[2])))-frame[0];
 const confidence=reliable&&layers.length>1?.82:.40;
 return {version:1,reliable:confidence>.7,confidence,body,frame,layers:layerData,fillings:gaps.map(g=>({...g,color:colorOf(data,w,g.bounds,channels)})),fruits:fruits.slice(0,10),leaves:leaves.slice(0,6),frosting:{color:creamColor,side:sideRegion?(sideRegion.center[0]>body[0]+body[2]/2?'right':'left'):null},crops:{cutFace:[clamp(frame[0]-frame[2]*.05,0,w),clamp(body[1]-body[3]*.03,0,h),frame[2]*1.1,body[3]*1.08],toppings:[clamp(frame[0]-frame[2]*.05,0,w),clamp(Math.min(...fruits.map(f=>f.bounds[1]),body[1]-body[3]*.6)-h*.03,0,h),frame[2]*1.15,body[3]*.83]},width:w,height:h};
}
