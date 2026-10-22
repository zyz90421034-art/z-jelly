const C={sponge:'#edc583',cream:'#e98fa8',red:'#dc6883',blue:'#77749f',green:'#88ad69'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const words={one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8};
const number=text=>Number(text)||words[text?.toLowerCase()];
const hex=rgb=>'#'+rgb.map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');
const pinkPigment=rgb=>hex([rgb[0],rgb[1],Math.max(rgb[2],rgb[1]+(rgb[0]-rgb[1])*.15)]);
const count=(text,noun,fallback)=>{const m=text.match(new RegExp(`\\b(one|two|three|four|five|six|seven|eight|[1-8])\\s+(?:(?:sponge|cake|whole|large|small)\\s+)?(?:${noun})\\b`,'i'));return m?clamp(number(m[1]),1,8):fallback;};
function namedColor(text,nouns,fallback){text=text.replace(/pinkish-red/g,'pink');const m=text.match(new RegExp(`\\b(pink|red|white|yellow|brown|chocolate|cream)\\s+(?:(?:sponge|cake|whipped|piped)\\s+)?(?:${nouns})\\b`,'i'));return m?({pink:C.cream,red:C.red,white:'#f7e4cf',yellow:C.sponge,brown:'#a97455',chocolate:'#93634e',cream:'#f1d7b4'}[m[1].toLowerCase()]):fallback;}
function captionFruits(text){
 const out=[];
 for(const [type,pattern,noun]of [['strawberry',/strawberr/,'strawberries|strawberry'],['blueberry',/blueberr/,'blueberries|blueberry'],['cherry',/cherr/,'cherries|cherry'],['raspberry',/raspberr/,'raspberries|raspberry']]){
  if(!pattern.test(text))continue;
  const cut=type==='strawberry'&&/half(?:\s+(?:a|of a|of the))?\s+strawberry|halved strawberry|sliced strawberry|strawberry\s+(?:half|slice|cut)/.test(text);
  const whole=type==='strawberry'&&/whole strawberry/.test(text);
  const n=cut&&whole?count(text,'whole strawberries|whole strawberry',1)+1:count(text,noun,1);
  for(let i=0;i<n;i++)out.push({type,cut:cut&&i===0,confidence:.45,estimated:true});
 }
 return out;
}
export function buildCakeBlueprint(kind,subject,description,palette,evidence=null){
 const text=(subject+' '+description).toLowerCase(),parts=[],uncertainties=[];
 const measured=!!evidence?.reliable&&evidence.layers?.length>=1&&evidence.layers.length<=5;
 const add=(name,type,color,position,size,extra={})=>{parts.push({name,type,color,position,size,rotation:[0,0,0],role:'soft',...extra});};
 const plate=/plate|dish/.test(text),floor=plate?.075:0;
 const cream=measured&&evidence.frosting?.color?pinkPigment(evidence.frosting.color):namedColor(text,'cream|frosting|icing|glaze',/pinkish/.test(text)?C.cream:'#f1d7b4');
 if(plate)add('plate','lathe','#f1e1cd',[0,.035,0],[1.25,.07,1.25],{role:'ceramic',profile:[[0,-.5],[.34,-.5],[.5,.10],[.5,.4],[.32,-.15],[0,-.15]]});
 const layers=measured?evidence.layers.length:count(text,'layers?',2),height=/tall|high/.test(text)?.84:.68;
 if(!measured)uncertainties.push('Layer count/thickness are caption-derived estimates; the cut-face measurement was not reliable.');
 const side=measured?evidence.frosting?.side:/right/.test(text)?'right':/left/.test(text)?'left':null;
 const yaw=kind==='cake-slice'?(side==='right'?-1.45:side==='left'?1.45:0):0;
 const shape=kind==='cake-slice'?'wedge':/square|rectangular/.test(text)?'box':'cylinder',width=.96,depth=kind==='cake-slice'?1.03:.96;
 const weights=[];for(let i=0;i<layers;i++){
  const sourceIndex=layers-1-i; // Pixel rows are top-to-bottom; construction is bottom-to-top.
  weights.push({name:'sponge-'+i,weight:measured?evidence.layers[sourceIndex].height:1,color:measured?hex(evidence.layers[sourceIndex].color):namedColor(text,'sponge|cake|layers?',/chocolate/.test(text)?'#93634e':C.sponge)});
  if(i<layers-1){const mean=measured?evidence.layers.reduce((n,l)=>n+l.height,0)/layers:1;
   weights.push({name:'filling-'+i,weight:measured?clamp(evidence.fillings?.[sourceIndex-1]?.height||mean*.35,mean*.15,mean*.70):.30,color:measured&&evidence.fillings?.[sourceIndex-1]?.color?pinkPigment(evidence.fillings[sourceIndex-1].color):namedColor(text,'filling|jam',cream)});
  }
 }
 const total=weights.reduce((n,l)=>n+l.weight,0);let y=floor;
 for(const band of weights){const h=height*band.weight/total;add(band.name,shape,band.color,[0,y+h/2,0],[width,h,depth],{rotation:[0,yaw,0]});y+=h;}
 let top=y;
 const hasIcing=measured&&evidence.frosting?.color||/cream|icing|frosting|ganache|glaze/.test(text);
 if(hasIcing){add('icing',shape,cream,[0,y+.028,0],[width*1.02,.056,depth*1.02],{rotation:[0,yaw,0]});top+=.056;}
 if(hasIcing&&side&&shape==='wedge')add('side-coating','cake-coating',cream,[0,floor+height/2,0],[width*1.04,height+.02,depth*1.04],{rotation:[0,yaw,0]});
 const piped=/piped|whipped|swirl|rosette|ruffl|ridge|frosting.*(?:edge|side)|cream.*(?:edge|side)/.test(text);
 if(piped){if(shape==='wedge')add('piped-border','cream-ribbon',cream,[0,top+.035,0],[width,.09,depth],{rotation:[0,yaw,0]});
  else for(let i=0;i<6;i++){const a=i*Math.PI/3;add('cream-rosette-'+i,'swirl',cream,[Math.sin(a)*.34,top+.07,Math.cos(a)*.34],[.17,.15,.17]);}}
 let fruits=measured&&evidence.fruits?.length?evidence.fruits:captionFruits(text);
 if(/chocolate|oreo|cookie/.test(evidence?.toppingsDescription||'')&&!/blueberr/.test(text))fruits=fruits.filter(f=>f.type!=='blueberry');
 const frame=evidence?.frame||evidence?.body;
 const ys=fruits.filter(f=>f.center).map(f=>f.center[1]),minY=Math.min(...ys),rangeY=Math.max(8,Math.max(...ys)-minY);
 const modeledFruits=[];
 function fitTop(x,z,margin){if(shape!=='wedge')return [x,z];const co=Math.cos(yaw),si=Math.sin(yaw);let u=x*co-z*si,v=x*si+z*co;v=clamp(v,-.36+margin,.32-margin);const edge=Math.max(.02,.42*(.5-v)/.84-margin);u=clamp(u,-edge,edge);return [u*co+v*si,-u*si+v*co];}
 for(let i=0;i<Math.min(fruits.length,8);i++){
  const f=fruits[i],blue=f.type==='blueberry';let x,z,sx,sy;
  if(frame&&f.center&&f.bounds){x=(f.center[0]-(frame[0]+frame[2]/2))/frame[2]*width*1.10;z=-.21+(f.center[1]-minY)/rangeY*.40;sx=clamp(f.bounds[2]/frame[2]*width,.12,.34);sy=clamp(f.bounds[3]/frame[3]*height,.12,.34);}
  else{const a=i/Math.max(fruits.length,1)*Math.PI*2;x=Math.sin(a)*.20;z=Math.cos(a)*.17;sx=blue?.15:.23;sy=blue?.15:.27;uncertainties.push('Fruit '+i+' position is estimated from its caption.');}
  sx*=1.06;sy=blue?sx*.92:Math.min(sy*.88,sx*1.10);
  [x,z]=fitTop(x,z,sx*.30);const name='fruit-'+i,angle=f.cut?-.08:0;
  const berryColor=blue?C.blue:f.type==='cherry'?'#c9577c':C.red;
  add(name,blue?'blueberry':f.cut?'berry-half':'berry',berryColor,[x,top+sy/2,z],[sx,sy,sx*.85],{role:'fruit',rotation:[angle,0,f.cut?-.18:.08],fruitType:f.type,cut:!!f.cut});
  add(name+'-shadow','contact-shadow','#9a627e',[x,top+.004,z],[sx*1.05,.01,sx*.84],{role:'contact'});
  if(f.cut){add(name+'-cut','berry-cutface','#f3a9ac',[x,top+sy/2,z+.003],[sx*.88,sy*.88,sx*.85],{role:'fruit',rotation:[angle,0,-.18]});add(name+'-core','ellipsoid','#f7d6b4',[x,top+sy*.53,z+sx*.03],[sx*.18,sy*.56,.008],{role:'fruit',rotation:[0,0,-.18]});}
  if(blue){add(name+'-crown','blueberry-crown','#aaa5c3',[x,top+sy*.94,z],[sx*.38,sy*.10,sx*.38],{role:'fruit'});}
  else if(f.type==='cherry')add('stem-'+i,'arc',C.green,[x,top+sy+.07,z],[.04,.16,.04]);
  modeledFruits.push({name,type:f.type,cut:!!f.cut,position:[x,z],sourceBounds:f.bounds||null});
 }
 // Fit a contact graph, not a decorative ring: adjacent image regions stay adjacent in 3D.
 const touching=[];
 for(let i=0;i<modeledFruits.length;i++)for(let j=i+1;j<modeledFruits.length;j++){
  const a=modeledFruits[i].sourceBounds,b=modeledFruits[j].sourceBounds;if(!a||!b)continue;
  const dx=Math.max(a[0]-b[0]-b[2],b[0]-a[0]-a[2],0),dy=Math.max(a[1]-b[1]-b[3],b[1]-a[1]-a[3],0);
  if(Math.hypot(dx,dy)<=Math.min(a[2],b[2])*.08)touching.push([modeledFruits[i].name,modeledFruits[j].name]);
 }
 const fruitBodies=parts.filter(p=>p.fruitType),original=new Map(fruitBodies.map(p=>[p.name,[p.position[0],p.position[2]]]));
 for(let iteration=0;iteration<24;iteration++){
  for(let i=0;i<fruitBodies.length;i++)for(let j=i+1;j<fruitBodies.length;j++){
   const a=fruitBodies[i],b=fruitBodies[j],near=touching.some(pair=>pair[0]===a.name&&pair[1]===b.name);
   let dx=b.position[0]-a.position[0],dz=b.position[2]-a.position[2],distance=Math.hypot(dx,dz);
   const size=(a.size[0]+b.size[0])*.5,target=size*(near?.89:1.07);
   if(!near&&distance>=target)continue;
   if(distance<.001){dx=.01;dz=.005;distance=Math.hypot(dx,dz);}
   const delta=(distance-target)*.42,ux=dx/distance,uz=dz/distance;
   a.position[0]+=ux*delta;a.position[2]+=uz*delta;b.position[0]-=ux*delta;b.position[2]-=uz*delta;
  }
  for(const p of fruitBodies){const [x,z]=fitTop(p.position[0],p.position[2],p.size[0]*.23);p.position[0]=x;p.position[2]=z;}
 }
 for(const fruit of fruitBodies){const old=original.get(fruit.name),dx=fruit.position[0]-old[0],dz=fruit.position[2]-old[1],id=fruit.name.split('-')[1];
  for(const p of parts)if(p!==fruit&&(p.name.startsWith(fruit.name+'-')||p.name==='stem-'+id)){p.position[0]+=dx;p.position[2]+=dz;}
  modeledFruits.find(f=>f.name===fruit.name).position=[fruit.position[0],fruit.position[2]];
 }

 const relations=parts.map(p=>({part:p.name,relation:'above',target:p.name==='plate'?'root':p.name.startsWith('sponge-')?(Number(p.name.split('-')[1])?'filling-'+(Number(p.name.split('-')[1])-1):plate?'plate':'root'):p.name.startsWith('filling-')?'sponge-'+p.name.split('-')[1]:p.name==='icing'||p.name==='side-coating'?'sponge-'+(layers-1):p.name.includes('-cut')||p.name.includes('-core')||p.name.includes('-crown')?p.name.replace(/-(cut|core|crown)$/,''):hasIcing?'icing':'sponge-'+(layers-1)}));
 for(const [a,b]of touching)relations.push({part:a,relation:'touching',target:b});
 const colors=[...new Set(parts.filter(p=>p.name!=='plate'&&p.role!=='contact').map(p=>p.color))].slice(0,16).map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
 return {version:3,engine:'local-vlm+measured-cake',kind,subject,description,supportSurface:top,palette:colors.length?colors:palette,parts,relations,construction:parts.map(p=>p.name),uncertainties,observations:[{feature:layers+' sponge layers',source:measured?'cut-face pixels':description}],measurements:measured?{body:frame,layers:evidence.layers,fruits:modeledFruits,touching,frostingSide:side}:null,audit:{status:'passed',observedLayers:measured?evidence.layers.length:null,modeledLayers:layers,observedFruit:measured?evidence.fruits.length:null,modeledFruit:modeledFruits.length,touchingPairs:touching.length,visualSimilarity:'not automatically scored'}};
}
