// A small object grammar: recognition selects named parts, never a traced photo mesh.
import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {jellyIllustrationMaterial} from './generated-material.js';

export const RULES=[
 ['burger',/hamburger|cheeseburger/],['dessert',/ice cream|icecream|trifle|pudding|custard|cake/],
 ['fruit',/apple|orange|lemon|banana|pineapple|strawberry|fig|pomegranate|jackfruit|pear|cucumber|acorn|cherry/],
 ['plant',/flower|daisy|sunflower|rapeseed|\bpot\b|vase|bouquet/],
 ['bottle',/bottle|jug|pitcher|coffee mug|cup|goblet|beaker|wine glass|vessel/],
 ['bird',/bird|penguin|duck|goose|hen|rooster|chick|parrot|macaw|toucan|owl|eagle|sparrow|finch|robin|flamingo|ostrich/],
 ['fish',/\b\w*fish\b|\bshark\b|\bray\b|\bstingray\b|\btench\b|\beel\b/],
 ['animal',/fox|wolf|coyote|dingo|dog|cat|tabby|kitten|terrier|hound|retriever|spaniel|poodle|collie|shepherd|pug|corgi|husky|malamute|chihuahua|beagle|pinscher|dachshund|pomeranian|dalmatian|setter|schnauzer|bulldog|shih|basset|labrador|borzoi|kuvasz|mastiff|leonberg|newfoundland|samoyed|schipperke|basenji|vizsla|whippet|weimaraner|pekinese|papillon|briard|bouvier|kelpie|tiger|lion|leopard|panda|bear|rabbit|hare|squirrel|hamster|koala|pig|elephant|horse|sorrel|zebra|deer|giraffe|sheep|ram|goat|cow|ox|bison|teddy/],
 ['vehicle',/\bcar\b|\bcab\b|taxi|\bbus\b|\bvan\b|truck|tractor|jeep|limousine|ambulance|fire engine|minivan|minibus|wagon|racer/],
 ['chair',/chair|throne|bench|sofa|couch/],['shoe',/shoe|sneaker|sandal|boot|loafer|clog/],
 ['bag',/backpack|bag|purse|wallet|satchel/],['camera',/camera|reflex|polaroid/],
 ['house',/house|church|palace|castle|monastery|barn|cottage/],
];

export function chooseObject(predictions,face){
 if(face&&face.probability>.85&&face.area>.018)return {kind:'person',variant:'portrait',confidence:face.probability};
 const matches=predictions.map(p=>{const rule=RULES.find(([,pattern])=>pattern.test(p.className.toLowerCase()));return rule?{kind:rule[0],variant:p.className.toLowerCase(),confidence:p.probability}:null;}).filter(Boolean);
 const best=matches[0];
 if(!best||best.confidence<.12||(predictions[0]?.probability>.55&&best.confidence<predictions[0].probability*.4))throw Error('没有明确识别到支持的主体。请换一张主体清楚、背景简单的图片。');
 return best;
}

function pastel(rgb,{s=.6,l=.56}={}){const color=new T.Color(`rgb(${rgb.join(',')})`),h={};color.getHSL(h,T.SRGBColorSpace);color.setHSL(h.h,T.MathUtils.clamp(h.s,.26,s),T.MathUtils.clamp(h.l,.30,l+.14),T.SRGBColorSpace);return '#'+color.getHexString();}
export function objectRecipe(semantic,analysis){
 const {kind,variant}=semantic,palette=analysis.palette;
 const main=pastel(palette[0]||[219,155,105]),accent=pastel(palette[1]||[237,177,135]);
 const cream='#f3dcb9',dark='#785c55',leaf='#9fc56d';
 const parts=[];const add=(name,type,color,position,size,rotation=[0,0,0])=>parts.push({name,type,color,position,size,rotation});
 const ball=(name,color,p,s)=>add(name,'ellipsoid',color,p,s);
 const box=(name,color,p,s)=>add(name,'box',color,p,s);
 const cylinder=(name,color,p,s,r)=>add(name,'cylinder',color,p,s,r);
 const cone=(name,color,p,s,r)=>add(name,'cone',color,p,s,r);
 const eyes=(y,z,spacing=.13)=>{for(const side of [-1,1])ball('eye',dark,[side*spacing,y,z],[.045,.055,.035]);};
 if(kind==='animal'){
  const bunny=/rabbit|hare/.test(variant),elephant=/elephant/.test(variant),long=/giraffe/.test(variant),horse=/horse|sorrel|zebra/.test(variant),fox=/fox|wolf|coyote|dingo/.test(variant),bear=/bear|panda|koala|teddy/.test(variant);
  ball('body',main,[0,.39,0],[.62,.57,.50]);ball('chest',horse?main:cream,[0,.45,.20],[.30,.36,.15]);
  ball('head',main,[0,long?1.02:horse?.92:.78,.09],horse?[.45,.49,.61]:[.61,.53,.49]);
  if(horse){cylinder('neck',main,[0,.64,.04],[.28,.42,.29]);ball('mane',dark,[0,.84,-.20],[.20,.51,.15]);}
  if(long)cylinder('neck',main,[0,.70,.02],[.22,.63,.23]);
  for(const side of [-1,1]){
   if(bunny)ball('ear',main,[side*.17,1.15,.04],[.17,.56,.17]);
   else if(bear||elephant)ball('ear',accent,[side*.32,.94,.03],[elephant?.36:.20,elephant?.38:.22,.14]);
   else cone('ear',main,[side*(horse?.15:.22),horse?1.20:1.05,.06],[horse?.15:.23,.29,.20],[0,0,-side*.20]);
   ball('front-leg',main,[side*.22,.14,.22],[.19,.28,.24]);ball('back-leg',main,[side*.23,.14,-.19],[.23,.28,.25]);
  }
  ball('muzzle',cream,[0,horse?.82:.70,horse?.40:.32],horse?[.33,.25,.28]:[.35,.23,.20]);ball('nose',dark,[0,horse?.82:.74,horse?.55:.43],[.075,.055,.045]);eyes(horse?.98:.84,.32);
  if(elephant){cylinder('trunk',main,[0,.55,.39],[.16,.45,.16]);}
  else {ball('tail',fox?main:accent,[.39,.39,-.13],[fox?.66:.38,.25,.25]);ball('tail-tip',cream,[fox?.66:.54,.47,-.13],[.22,.22,.22]);}
 }else if(kind==='person'){
  const skin=pastel(analysis.skin||[231,175,139],{s:.52,l:.68}),hair=pastel(analysis.hair||[111,76,56],{s:.50,l:.42}),shirt=pastel(analysis.shirt||palette[0]||[133,176,205]);
  ball('torso',shirt,[0,.45,0],[.48,.47,.30]);ball('head',skin,[0,.88,0],[.57,.56,.46]);ball('hair',hair,[0,1.06,-.03],[.59,.29,.48]);
  for(const side of [-1,1]){ball('ear',skin,[side*.29,.88,0],[.09,.13,.10]);ball('arm',shirt,[side*.30,.44,0],[.17,.38,.20]);ball('hand',skin,[side*.32,.27,.02],[.15,.15,.15]);cylinder('leg',accent,[side*.14,.17,0],[.18,.29,.20]);ball('shoe',dark,[side*.14,.035,.06],[.22,.11,.30]);}
  eyes(.90,.22,.11);ball('nose',skin,[0,.84,.25],[.07,.08,.07]);ball('smile','#bf7e80',[0,.77,.21],[.11,.025,.025]);
 }else if(kind==='burger'){
  cylinder('lower-bun','#e9b979',[0,.16,0],[.88,.20,.74]);ball('top-bun','#edbd7c',[0,.64,0],[.92,.39,.79]);
  cylinder('patty','#9a6951',[0,.34,0],[.91,.17,.77]);cylinder('tomato','#da8877',[0,.45,0],[.91,.075,.78]);box('cheese','#eed275',[0,.40,0],[.96,.055,.81]);
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2;ball('lettuce',leaf,[Math.sin(a)*.35,.50,Math.cos(a)*.30],[.30,.075,.23]);}
  for(let i=0;i<7;i++){const a=i*2.4;ball('sesame',cream,[Math.sin(a)*.27,.81-Math.abs(Math.sin(a))*.035,Math.cos(a)*.20],[.028,.018,.065]);}
 }else if(kind==='fruit'){
  if(/banana/.test(variant)){for(let i=0;i<4;i++)ball('banana','#e6d477',[(i-1.5)*.15,.27+Math.abs(i-1.5)*.075,0],[.32,.28,.32]);}
  else if(/pineapple/.test(variant)){ball('fruit',main,[0,.46,0],[.65,.78,.65]);for(let i=0;i<5;i++)cone('crown',leaf,[(i-2)*.09,.99,0],[.17,.50,.16],[0,0,(i-2)*-.25]);}
  else {ball('fruit',main,[0,.44,0],[.75,.78,.70]);cylinder('stem',dark,[0,.88,0],[.055,.18,.055]);ball('leaf',leaf,[.16,.90,0],[.28,.08,.13]);if(/strawberry/.test(variant))for(let i=0;i<7;i++)ball('seed',cream,[Math.sin(i*2.4)*.24,.30+i*.045,.30],[.025,.04,.02]);}
 }else if(kind==='bottle'){
  const cup=/cup|mug|goblet|beaker|glass/.test(variant);
  cylinder('body',main,[0,.37,0],[.62,.69,.62]);
  if(cup){add('rim','torus',cream,[0,.72,0],[.62,.62,.62],[Math.PI/2,0,0]);add('handle','torus',accent,[.40,.42,0],[.35,.44,.27],[0,0,0]);cylinder('drink',accent,[0,.72,0],[.48,.035,.48]);}
  else {ball('shoulder',main,[0,.70,0],[.61,.27,.61]);cylinder('neck',main,[0,.91,0],[.24,.36,.24]);cylinder('cap',accent,[0,1.12,0],[.29,.12,.29]);box('label',cream,[0,.41,.315],[.36,.29,.025]);}
 }else if(kind==='plant'){
  cylinder('pot',accent,[0,.20,0],[.51,.38,.51]);cylinder('soil',dark,[0,.40,0],[.45,.04,.45]);
  for(let i=0;i<3;i++){const x=(i-1)*.21,y=.80+(i%2)*.18;cylinder('stem',leaf,[x,.59,0],[.035,.41,.035]);for(let j=0;j<5;j++){const a=j/5*Math.PI*2;ball('petal',main,[x+Math.sin(a)*.13,y+Math.cos(a)*.13,.02],[.20,.20,.12]);}ball('flower-center',cream,[x,y,.08],[.16,.16,.12]);}
 }else if(kind==='bird'||kind==='fish'){
  if(kind==='fish'){ball('body',main,[0,.45,0],[.78,.52,.35]);cone('tail',accent,[-.52,.45,0],[.43,.41,.12],[0,0,-Math.PI/2]);ball('eye',dark,[.25,.52,.16],[.05,.06,.035]);cone('fin',accent,[0,.79,0],[.27,.25,.10]);}
  else {ball('body',main,[0,.36,0],[.61,.61,.52]);ball('chest',cream,[0,.36,.22],[.38,.40,.12]);ball('head',main,[0,.79,.07],[.46,.46,.41]);cone('beak',accent,[0,.73,.33],[.18,.27,.16],[Math.PI/2,0,0]);eyes(.84,.25,.12);for(const side of [-1,1]){ball('wing',accent,[side*.29,.42,0],[.17,.43,.32]);ball('foot','#dfb277',[side*.13,.035,.10],[.20,.07,.24]);}}
 }else if(kind==='vehicle'){
  box('body',main,[0,.30,0],[.96,.35,.53]);box('cabin',main,[0,.56,0],[.56,.31,.49]);box('windshield','#b4d7da',[.04,.58,.253],[.40,.20,.025]);
  for(const x of [-.30,.30])for(const z of [-.27,.27]){cylinder('wheel',dark,[x,.16,z],[.28,.13,.28],[Math.PI/2,0,0]);ball('hub',cream,[x,.16,z*1.23],[.13,.13,.025]);}
  for(const z of [-.17,.17])ball('headlight',cream,[.49,.31,z],[.025,.11,.10]);
 }else if(kind==='chair'){
  box('seat',main,[0,.42,0],[.69,.15,.60]);box('back',main,[0,.78,-.24],[.69,.65,.16]);for(const x of [-.25,.25])for(const z of [-.20,.20])cylinder('leg',accent,[x,.19,z],[.09,.37,.09]);
 }else if(kind==='shoe'){
  box('sole',cream,[0,.09,0],[.87,.13,.43]);ball('toe',main,[.23,.23,0],[.48,.35,.43]);box('heel',main,[-.20,.31,0],[.37,.45,.43]);for(let i=0;i<3;i++)box('lace',cream,[-.07+i*.095,.42-i*.035,0],[.035,.03,.33]);
 }else if(kind==='bag'){
  box('body',main,[0,.46,0],[.63,.79,.32]);box('pocket',accent,[0,.35,.19],[.46,.31,.11]);add('handle','torus',accent,[0,.91,0],[.31,.27,.15]);
 }else if(kind==='camera'){
  box('body',main,[0,.40,0],[.83,.55,.30]);cylinder('lens',accent,[.04,.39,.24],[.39,.25,.39],[Math.PI/2,0,0]);ball('glass','#a3c7d3',[.04,.39,.38],[.27,.27,.04]);box('viewfinder',cream,[-.26,.54,.17],[.14,.12,.04]);box('shutter',accent,[.28,.73,0],[.13,.09,.12]);
 }else if(kind==='house'){
  box('walls',main,[0,.36,0],[.73,.70,.59]);cone('roof',accent,[0,.91,0],[1,.47,.89],[0,Math.PI/4,0]);box('door',dark,[0,.23,.305],[.19,.40,.035]);for(const side of [-1,1])box('window',cream,[side*.24,.48,.31],[.15,.19,.035]);
 }else if(kind==='dessert'){
  cylinder('cup',accent,[0,.22,0],[.59,.42,.59]);for(let i=0;i<3;i++){const a=i*2.1;ball('scoop',i===1?cream:main,[Math.sin(a)*.12,.54+i*.11,Math.cos(a)*.09],[.47,.41,.47]);}ball('cherry','#d8888c',[0,.99,0],[.17,.17,.17]);
 }else throw Error('这个物体暂时还没有对应的几何组合规则。');
 return {version:1,...semantic,palette,parts};
}

export function primitiveStudy(recipe){
 const root=new T.Group(),meshes=[];root.userData.primitive=true;
 for(const part of recipe.parts){
  let g;
  if(part.type==='ellipsoid')g=new T.SphereGeometry(.5,12,8);
  else if(part.type==='cylinder')g=new T.CylinderGeometry(.5,.5,1,12,1);
  else if(part.type==='cone')g=new T.ConeGeometry(.5,1,10,1);
  else if(part.type==='torus')g=new T.TorusGeometry(.43,.07,6,16);
  else g=new RoundedBoxGeometry(1,1,1,2,.12);
  g.scale(...part.size);g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(...part.rotation)));g.translate(...part.position);g.rotateY(Math.PI*.63);
  const material=jellyIllustrationMaterial({color:new T.Color(part.color)},g),mesh=new T.Mesh(g,material);mesh.name=part.name;mesh.layers.set(1);mesh.frustumCulled=false;root.add(mesh);meshes.push(mesh);
 }
 const bounds=new T.Box3().setFromObject(root),size=bounds.getSize(new T.Vector3()),center=bounds.getCenter(new T.Vector3()),scale=.082/Math.max(size.x,size.y,size.z);
 for(const mesh of meshes){mesh.geometry.translate(-center.x,-bounds.min.y,-center.z);mesh.geometry.scale(scale,scale,scale);}
 const dimensions=new T.Box3().setFromObject(root).getSize(new T.Vector3());
 return {root,meshes,height:dimensions.y,radius:Math.max(dimensions.x,dimensions.z)/2};
}
