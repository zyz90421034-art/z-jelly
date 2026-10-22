import * as T from 'three';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function isFruitDrink(text,evidence){
 return /\b(juice|lemonade|cocktail|fruit punch|fruit drink|sangria)\b/.test(text)||/strawberr|kiwi|blueberr|orange slice|lemon slice|fruit pieces|fruits/.test(text)&&/glass|cup|drink|beverage|liquid/.test(text)||evidence?.reliable===true&&evidence.fruits?.length>=2;
}
export function buildDrinkBlueprint(subject,description,palette,evidence){
 const text=(subject+' '+description).toLowerCase(),measured=evidence?.reliable,parts=[];
 const add=(name,type,color,position,size,role,extra={})=>parts.push({name,type,color,position,size,role,rotation:[0,0,0],...extra});
 const vb=measured?evidence.vessel:[0,0,1,1.55],w=.82,h=clamp(vb[3]/vb[2]*w,.85,1.65),bottom=.055,fill=measured?evidence.fill:.81,top=bottom+(h-bottom)*fill;
 const liquidColor=measured&&evidence.liquidColor?evidence.liquidColor:/pink|strawberr|rose/.test(text)?'#f4a59e':/orange/.test(text)?'#edb565':/lemon/.test(text)?'#eedf89':/green|kiwi/.test(text)?'#b7d17e':'#e5b09f';
 add('vessel','lathe','#d4e6ed',[0,h/2,0],[w,h,w],'clear-glass',{profile:[[0,-.5],[.43,-.5],[.47,-.46],[.5,.5],[.481,.5],[.451,-.443],[0,-.443]]});
 add('rim','torus','#dfedf2',[0,h,0],[w,w,w],'clear-glass',{rotation:[Math.PI/2,0,0]});
 add('drink','lathe',liquidColor,[0,(bottom+top)/2,0],[w*.95,top-bottom,w*.95],'clear-liquid',{profile:[[0,-.5],[.45,-.5],[.49,.5],[0,.5]]});
 let fruits=measured?evidence.fruits:[];
 if(!measured){const types=[[/strawberr/,'red','#ed756e'],[/orange|lemon/,'citrus','#f3b347'],[/kiwi/,'green','#b9cf69'],[/blueberr/,'dark-berry','#6b668e']].filter(([re])=>re.test(text));fruits=types.map(([,family,color],i)=>({family,color,center:[.28+(i%2)*.38,.40+Math.floor(i/2)*.23],box:[0,0,.29,.24]}));}
 for(const [i,f]of fruits.entries()){
  const prefix='fruit-'+i,[cx,cy]=f.center;
  let x=measured?((cx-vb[0])/vb[2]-.5)*w:(cx-.5)*w,y=measured?h*(1-(cy-vb[1])/vb[3]):h*(1-cy);
  const fw=clamp((measured?f.box[2]/vb[2]:f.box[2])*w,.10,w*.46),fh=clamp((measured?f.box[3]/vb[3]*h:f.box[3]*h),.10,h*.36),radius=w*.44;
  x=clamp(x,-radius+fw/2,radius-fw/2);y=clamp(y,bottom+fh/2,top+fh*.14);
  // A shallow front cluster preserves photo adjacency; z is explicitly estimated.
  const z=Math.sqrt(Math.max(.008,radius*radius-x*x))*.27,extra={insideLiquid:true,fruitType:f.family,sourceBox:f.box},start=parts.length;
  // Every detail is built in a local solid fruit frame and rotated with the body.
  // Narrow projected ellipses indicate a tilted round slice, not a thin oval mesh.
  const tilt=[.13+(i%3)*.11,((i%3)-1)*.32,((i%2)*2-1)*.15];
  if(f.family==='red'){
   const cut=f.cut===true||!measured&&i%2===0,depth=fw*(cut?.85:.96);
   add(prefix,cut?'berry-half':'berry','#e85d70',[x,y,z],[fw,fh,depth],'fruit',{...extra,cut});
   if(cut)add(prefix+'-face','berry-cutface','#ffad98',[x,y,z+.002],[fw*.88,fh*.94,.012],'flesh',{insideLiquid:true});
   else for(let k=0;k<7;k++){const a=k/7*Math.PI*2;add(prefix+'-seed-'+k,'ellipsoid','#ffd490',[x+Math.sin(a)*fw*.30,y+Math.cos(a)*fh*.29,z+depth*.36],[.012,.020,.010],'fruit',{insideLiquid:true});}
  }else if(f.family==='dark-berry'){
   const diameter=Math.max(fw,fh);
   add(prefix,'blueberry','#686194',[x,y,z],[diameter,diameter*.96,diameter],'fruit',extra);
   add(prefix+'-crown','blueberry-crown','#514b70',[x,y,z+diameter*.48],[diameter*.29,.012,diameter*.29],'fruit',{rotation:[Math.PI/2,0,0],insideLiquid:true});
  }else{
   const citrus=f.family==='citrus',diameter=Math.max(fw,fh),thickness=diameter*(citrus?.30:.42),flat=measured&&fh<fw*.42,chunk=measured&&!citrus&&f.box[2]/f.box[3]>.9;
   if(flat){tilt[0]=Math.acos(clamp(fh/diameter,.12,.9));y=top-thickness*.25;}
   if(chunk){tilt[1]+=.40;}
   add(prefix,chunk?'box':'cylinder',citrus?'#f3af45':'#97b95c',[x,y,z],chunk?[diameter,diameter*.82,thickness*1.5]:[diameter,thickness,diameter],'fruit',{...extra,rotation:chunk?[0,0,0]:[Math.PI/2,0,0]});
   add(prefix+'-flesh',chunk?'box':'cylinder',citrus?'#ffd18a':'#cadd83',[x,y,z+thickness*(chunk?.77:.51)],chunk?[diameter*.87,diameter*.70,.018]:[diameter*.87,.018,diameter*.87],'flesh',{rotation:chunk?[0,0,0]:[Math.PI/2,0,0],insideLiquid:true});
   for(let k=0;k<8;k++){
    const a=k/8*Math.PI*2;
    if(citrus)add(prefix+'-segment-'+k,'ellipsoid','#f7b75f',[x+Math.sin(a)*diameter*.25,y+Math.cos(a)*diameter*.25,z+thickness*.56],[diameter*.17,diameter*.23,.018],'fruit',{insideLiquid:true,rotation:[0,0,-a]});
    else add(prefix+'-seed-'+k,'ellipsoid','#6d685a',[x+Math.sin(a)*diameter*.24,y+Math.cos(a)*diameter*.24,z+thickness*(chunk?.84:.56)],[diameter*.025,diameter*.055,.012],'fruit',{insideLiquid:true,rotation:[0,0,-a]});
   }
  }
  const turn=new T.Quaternion().setFromEuler(new T.Euler(...tilt));
  for(const p of parts.slice(start)){const v=new T.Vector3(...p.position).sub(new T.Vector3(x,y,z)).applyQuaternion(turn).add(new T.Vector3(x,y,z));p.position=v.toArray();const q=new T.Quaternion().setFromEuler(new T.Euler(...p.rotation)).premultiply(turn);p.rotation=new T.Euler().setFromQuaternion(q).toArray().slice(0,3);}
 }
 const colors=[liquidColor,...parts.filter(p=>p.fruitType).map(p=>p.color)];
 return {version:3,engine:'local-vlm+scene-blueprint',kind:'fruit-drink',subject,description,palette:colors.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16))),parts,relations:parts.map(p=>({part:p.name,target:p.name==='vessel'?'root':p.name==='rim'||p.name==='drink'?'vessel':'drink',relation:p.name==='rim'?'attached-to':'inside'})),observations:[{feature:'separate fruit, tinted liquid and hollow glass',source:measured?'image color regions + vessel recognition':description}],uncertainties:[evidence?.uncertainty||'Fruit count and placement are caption-based estimates.'],construction:parts.map(p=>p.name),audit:{status:'passed',checks:['liquid inside glass','interior fruit before liquid before glass'],visualSimilarity:'not automatically scored'}};
}
