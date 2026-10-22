// Evidence -> dimensions -> independently editable parts. No model-written code is executed.
import {buildCakeBlueprint} from './cake-blueprint.js';
const COLORS={white:'#f6e6cb',cream:'#f5dcb3',brown:'#a76c49',chocolate:'#865847',pink:'#e98fa8',red:'#dc6883',green:'#9caf69',blue:'#94c8d4',yellow:'#f1cc75',purple:'#b496c9',orange:'#eeb079',black:'#785966'};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function affirmative(text){return text.toLowerCase().replace(/\b(?:does not have|doesn't have|has no|without)\s+(?:a |any )?(?:handle|plate|saucer|cream|fruit|foam)/g,'').replace(/\b(?:no|without|not|absent)\s+(?:(?:a|any|visible)\s+)?[\w-]+(?:\s+(?:handle|plate|saucer|cream|fruit|foam))?/g,'');}
function colorNear(text,nouns,fallback){
 text=text.replace(/\b(pink|red|green|blue|yellow|brown|purple|orange)ish\b/gi,'$1').replace(/\b(pink|red|green|blue|yellow|brown|purple|orange)-(pink|red|green|blue|yellow|brown|purple|orange)\b/gi,'$1');
 const terms=Object.keys(COLORS).join('|');
 // Do not cross conjunctions/counts: "cream and four strawberries" is not cream-colored fruit.
 const modifiers='ceramic|glass|coffee|sponge|frosted|iced|plastic|paper|chocolate|colored|coloured|light|dark';
 const match=text.match(new RegExp(`\\b(${terms})\\s+(?:(?:${modifiers})\\s+){0,2}(?:${nouns})\\b`,'i'));
 const reverse=text.match(new RegExp(`\\b(?:${nouns})\\s+(?:is|looks|appears|are|being)\\s+(?:to be\\s+)?(?:light |dark )?(${terms})\\b`,'i'));
 return match?COLORS[match[1].toLowerCase()]:reverse?COLORS[reverse[1].toLowerCase()]:fallback;
}
function countNear(text,noun,fallback,max=8){const m=text.match(new RegExp(`\\b(one|two|three|four|five|six|seven|eight|[1-8])\\s+(?:[\\w-]+\\s+){0,1}(?:${noun})\\b`,'i'));return m?clamp(Number(m[1])||({one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8}[m[1].toLowerCase()]),1,max):fallback;}
export function foodKind(subject,description=''){
 description=String(description).toLowerCase();
 const label=subject.toLowerCase(),all=(subject+' '+description).toLowerCase();
 if(/cake|torte|gateau|cheesecake/.test(label))return /slice|piece|wedge|triang/.test(all)?'cake-slice':'cake';
 if(/parfait|sundae|trifle|pudding|custard|gelatin|jelly|ice.?cream/.test(label))return 'dessert-cup';
 const specific=/\b(person|woman|man|child|cat|dog|horse|bird|car|camera|house|bottle|carton|sculpture|figurine|statue)\b/.test(label);
 const drink=/\b(coffee|espresso|cappuccino|latte|mocha|macchiato|cocoa|chocolate drink|hot chocolate|tea|milk|mug|teacup|cup|tumbler|beaker|goblet|beverage|drink|smoothie|milkshake|frappe|frappuccino)\b/;
 if(!specific&&(drink.test(label)||/\b(?:a|the|one) glass[.!]?$|^glass[.!]?$|\b(?:plastic|drinking|disposable|wine) glass\b/.test(label)))return 'coffee-cup';
 // A broad name must be refined by the detailed observation, not rejected before using it.
 // Do not let a background cup turn a recognized person, animal or other specific object into a drink.
 const generic=/\b(object|item|container|vessel|food|dessert|something|image|picture|photo)\b/.test(label);
 const mainVessel=/^(?:(?:the |this )?(?:image|picture|photo) (?:shows|depicts|contains) |there is |this is )?(?:a |an |the )?(?:(?:clear|transparent|plastic|disposable|tall|short|wide|small|large|single|brown|white|blue|green|red|pink|yellow|ceramic|paper|iced|cold|hot|coffee|tea|drinking)\s+){0,6}(?:cup|mug|tumbler|goblet|beaker|glass)\b/.test(description.trim());
 if(!specific&&mainVessel)return 'coffee-cup';
 if(generic&&!specific){
  if(/\b(cake|torte|gateau|cheesecake)\b/.test(description))return /slice|piece|wedge|triang/.test(description)?'cake-slice':'cake';
  if(/\b(parfait|sundae|trifle|pudding|custard|gelatin|jelly|ice.?cream)\b/.test(description))return 'dessert-cup';
  if(drink.test(description)||/\bglass\s+(?:of|filled with)\b/.test(description))return 'coffee-cup';
 }
 return null;
}
export function buildFoodBlueprint(subject,description,palette,imageEvidence=null){
 const kind=foodKind(subject,description);if(!kind)return null;
 if(kind==='cake'||kind==='cake-slice')return validateBlueprint(buildCakeBlueprint(kind,subject,description,palette,imageEvidence));
 const text=affirmative(subject+' '+description),raw=(subject+' '+description).toLowerCase();
 const parts=[],observations=[],uncertainties=[];
 const add=(id,type,color,position,size,role='soft',extra={})=>{parts.push({name:id,type,color,position,size,rotation:[0,0,0],role,...extra});};
 const evidence=(feature,present)=>{if(present)observations.push({feature,source:description});return present;};
 const plate=evidence('plate',/saucer|plate|dish/.test(text));
 const cream=colorNear(text,'cream|frosting|icing|glaze',COLORS.cream);
 const fruitColor=colorNear(text,'berries|berry|cherries|cherry|strawberries|strawberry',COLORS.red);
 const berry=evidence('fruit topping',/strawberr|blueberr|raspberr|cherr|berr/.test(text));
 const isBlue=/blueberr/.test(text),isCherry=/cherr/.test(text);
 const fruitCount=berry?countNear(text,'strawberries|blueberries|raspberries|cherries|berries|strawberry|cherry',3):0;
 if(berry&&!/\b(one|two|three|four|five|six|seven|eight|[1-8])\s/.test(text))uncertainties.push('Fruit count is approximate; the caption did not establish a count.');
 let floor=plate?.085:0,bodyTop=0;
 if(plate)add('plate','lathe',colorNear(text,'plate|saucer|dish',COLORS.white),[0,.045,0],[1.18,.09,1.18],'ceramic',{profile:[[0,-.5],[.35,-.5],[.5,0],[.5,.35],[.34,-.18],[0,-.18]]});
 if(plate&&evidence('spoon',/spoon/.test(text))){add('spoon-bowl','ellipsoid','#bac7d8',[.42,.105,.05],[.16,.035,.23],'soft');add('spoon-handle','box','#bac7d8',[.42,.10,.28],[.045,.025,.36],'soft');}
 if(kind==='coffee-cup'||kind==='dessert-cup'){
  const dessert=kind==='dessert-cup',tall=/tall|glass|tumbler|goblet|parfait|plastic cup|disposable cup/.test(text)&&!/short|wide|shallow/.test(text);
  const shallow=/wide|shallow|bowl/.test(text),h=tall?1.05:shallow?.52:.70,w=tall?.70:shallow?1.0:.86,y=floor+h/2;
  const glass= /glass|transparent|clear/.test(text)||dessert;
  const cupColor=colorNear(text,'cup|mug|glass|bowl',glass?'#c6dce3':COLORS.white);
  add('vessel','lathe',cupColor,[0,y,0],[w,h,w],glass?'glass':'ceramic',{profile:[[0,-.5],[.32,-.5],[.36,-.44],[.5,.46],[.5,.5],[.455,.5],[.32,-.39],[0,-.39]]});
  add('rim','torus',cupColor,[0,floor+h,0],[w,w,w],glass?'glass':'ceramic',{rotation:[Math.PI/2,0,0]});
  const handle=evidence('handle',/handle|mug|teacup/.test(text)&&!/(?:no|without|does not have|doesn't have)\s+(?:a\s+)?handle/.test(raw));
  if(handle){const side=/left/.test(text)?-1:1;add('handle','arc',cupColor,[side*w*.46,floor+h*.52,0],[w*.50,h*.65,.13],glass?'glass':'ceramic',{side});if(!/left|right/.test(text))uncertainties.push('Handle side was not established; right-side design placement used.');}
  if(dessert){
   const layers=countNear(text,'layers?',/layer/.test(text)?3:2,5),start=floor+h*.17,end=floor+h*.82,dh=(end-start)/layers;
   if(!/\b(one|two|three|four|five|[1-5])\s+(?:\w+\s+)?layers?/.test(text))uncertainties.push('Dessert layer count uses a design estimate.');
   for(let i=0;i<layers;i++){const color=i%2===0?colorNear(text,'pudding|custard|jelly|gelatin|ice.?cream',COLORS.pink):cream;const bottom=.32+.10*i/layers,top=.32+.10*(i+1)/layers;add('dessert-layer-'+i,'lathe',color,[0,start+dh*(i+.5),0],[w,dh,w],i%2===0?'liquid':'soft',{profile:[[0,-.5],[bottom,-.5],[top,.5],[0,.5]]});}
   bodyTop=end;
   if(/whip|cream|scoop/.test(text))add('cream-swirl','swirl',cream,[0,bodyTop+.10,0],[w*.65,.24,w*.65]);
  }else{
   const drinkColor=/matcha|green tea/.test(text)?COLORS.green:/milk|latte|cappuccino|light brown/.test(text)?'#c58b61':COLORS.brown;
   bodyTop=floor+h*.85;
   add('drink','lathe',drinkColor,[0,floor+h*.50,0],[w*.84,h*.68,w*.84],'liquid',{profile:[[0,-.5],[.36,-.5],[.5,.5],[0,.5]]});
   if(evidence('foam',/foam|froth|latte art|cappuccino/.test(text))){
    add('foam','cylinder',cream,[0,bodyTop+.009,0],[w*.78,.018,w*.78],'soft');
    if(/art|heart|rosetta|pattern|swirl/.test(text))add('latte-art','swirl',drinkColor,[0,bodyTop+.027,0],[w*.42,.012,w*.42],'soft');
   }
   if(evidence('whipped cream',/whipped cream|whipping cream|cream topping|cream on top/.test(text))){add('cream-swirl','swirl',cream,[0,bodyTop+.15,0],[w*.70,.32,w*.70]);}
  }
  observations.push({feature:tall?'tall vessel':'short vessel',source:description});
 }

 if(berry){for(let i=0;i<fruitCount;i++){
  const a=i/fruitCount*Math.PI*2,r=kind==='cake-slice'?.12:.23,x=Math.sin(a)*r,z=Math.cos(a)*r;
  add('fruit-'+i,'ellipsoid',isBlue?'#8c8bbf':fruitColor,[x,bodyTop+.12,z],[.19,isCherry?.19:.25,.19],'fruit');
  if(isCherry)add('stem-'+i,'arc',COLORS.green,[x+.025,bodyTop+.27,z],[.025,.18,.025],'soft');
  else if(!isBlue)add('leaf-'+i,'ellipsoid',COLORS.green,[x,bodyTop+.245,z],[.17,.025,.10],'soft');
 }}
 const colors=[...new Set(parts.filter(p=>p.role!=='glass'&&p.name!=='plate'&&!p.name.startsWith('spoon')).map(p=>p.color))];
 const subjectPalette=colors.map(c=>[1,3,5].map(i=>parseInt(c.slice(i,i+2),16)));
 const has=name=>parts.some(p=>p.name===name),last=prefix=>parts.filter(p=>p.name.startsWith(prefix)).at(-1)?.name;
 const top=has('cream-swirl')?'cream-swirl':has('icing')?'icing':last('dessert-layer-')||last('sponge-')||'drink';
 const relations=parts.map(p=>{
  let target='root',relation='above';
  if(p.name==='vessel')target=has('plate')?'plate':'root';
  else if(p.name==='handle'||p.name==='rim'){target='vessel';relation='attached-to';}
  else if(/^(drink|dessert-layer)/.test(p.name)){target='vessel';relation='inside';}
  else if(p.name==='foam')target='drink';
  else if(p.name==='latte-art')target='foam';
  else if(p.name==='cream-swirl')target=last('dessert-layer-')||'drink';
  else if(p.name.startsWith('fruit-')||p.name.startsWith('cream-rosette-'))target=top;
  else if(/^(leaf|stem)-/.test(p.name)){target='fruit-'+p.name.split('-').at(-1);relation='attached-to';}
  else if(p.name.startsWith('sponge-')){const i=Number(p.name.split('-')[1]);target=i?'filling-'+(i-1):has('plate')?'plate':'root';}
  else if(p.name.startsWith('filling-'))target='sponge-'+p.name.split('-')[1];
  else if(p.name==='icing')target=last('sponge-');
  else if(p.name==='spoon-bowl')target='plate';
  else if(p.name==='spoon-handle'){target='spoon-bowl';relation='attached-to';}
  return {part:p.name,relation,target};
 });
 const blueprint={version:3,engine:'local-vlm+scene-blueprint',kind,subject,description,palette:subjectPalette.length?subjectPalette:palette,parts,relations,observations,uncertainties,construction:parts.map(p=>p.name)};
 validateBlueprint(blueprint);blueprint.audit={status:'passed',checks:['finite dimensions','unique components','liquid inside vessel','bounded part count'],visualSimilarity:'not automatically scored'};return blueprint;
}
export function validateBlueprint(blueprint){
 if(blueprint.version!==3||!['coffee-cup','cake','cake-slice','dessert-cup'].includes(blueprint.kind))throw Error('不支持的建模蓝图。');
 if(!Array.isArray(blueprint.parts)||!blueprint.parts.length||blueprint.parts.length>96)throw Error('建模蓝图的部件数量无效。');
 const names=new Set();for(const p of blueprint.parts){
  if(typeof p.name!=='string'||!['lathe','wedge','arc','swirl','ellipsoid','cylinder','torus','box','cake-coating','cream-ribbon','berry','berry-half','berry-cutface','blueberry','blueberry-crown','leaf','contact-shadow'].includes(p.type)||!['glass','ceramic','liquid','soft','fruit','flesh','contact'].includes(p.role))throw Error('不支持的建模部件。');
  if(names.has(p.name))throw Error('建模蓝图含重复部件。');names.add(p.name);
  if(!/^#[\da-f]{6}$/i.test(p.color)||![p.position,p.size,p.rotation].every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))||p.size.some(n=>n<=0||n>4)||p.position.some(n=>Math.abs(n)>4))throw Error('建模蓝图的尺寸或颜色无效。');
  if(p.type==='lathe'&&(!Array.isArray(p.profile)||p.profile.length<3||p.profile.length>32||!p.profile.every(v=>Array.isArray(v)&&v.length===2&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=1)&&v[0]>=0)))throw Error('容器截面无效。');
 }
 const vessel=blueprint.parts.find(p=>p.name==='vessel'),drink=blueprint.parts.find(p=>p.name==='drink');
 if(!Array.isArray(blueprint.relations)||blueprint.relations.some(r=>!names.has(r.part)||r.target!=='root'&&!names.has(r.target)||r.target===r.part))throw Error('部件连接关系无效。');
 if(vessel&&drink&&(drink.size[0]>=vessel.size[0]||drink.position[1]+drink.size[1]/2>vessel.position[1]+vessel.size[1]/2))throw Error('液体超出容器。');
 return blueprint;
}
