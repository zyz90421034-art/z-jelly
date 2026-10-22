import {RULES,objectRecipe} from './semantic-recipes.js';
import {buildFoodBlueprint,foodKind,validateBlueprint} from './food-blueprint.js';

export function identifySubject(label,description=''){
 const text=String(label).toLowerCase().trim();
 if(foodKind(text,description))return {kind:foodKind(text,description),variant:text+' '+description.toLowerCase(),confidence:1};
 if(/\b(person|woman|man|girl|boy|child|portrait|human|officer|astronaut|chef|doctor)\b/.test(text))return {kind:'person',variant:text+' '+description.toLowerCase(),confidence:1};
 const matches=RULES.filter(([,pattern])=>pattern.test(text));
 // A color adjective such as "orange" must not turn an orange cat into a fruit.
 const preferred=['animal','bird','fish','vehicle','camera','chair','shoe','bag','house','bottle','plant'];
 const kind=preferred.find(k=>matches.some(([key])=>key===k))||matches[0]?.[0];
 if(kind)return {kind,variant:text+' '+description.toLowerCase(),confidence:1};
 if(/\b(dessert|jelly|gelatin|parfait)\b/.test(text))return {kind:'dessert',variant:text+' '+description.toLowerCase(),confidence:1};
 throw Error('已分析照片，但这个主体的几何部件暂不受支持。请试试动物、人物、水果、甜品或常见物品。');
}

export function buildModelingPrompt(subject,description,palette,observations=null){
 const clean=text=>String(text).replace(/[\r\n]+/g,' ').trim();
 const blueprint=buildFoodBlueprint(clean(subject),clean(description),palette,observations);
 return `Subject: ${clean(subject)}\nAppearance: ${clean(description)}\nPalette: ${JSON.stringify(palette)}\nCreate a rounded low-poly cartoon study. Build separate simple volumes for the recognizable components. Preserve their colors and relative placement. Use substantial rounded shapes and cute proportions. Apply the website's colored translucent jelly material, soft highlights and elastic movement. Match the pastel painted background to the subject. No floor, pedestal or background objects.${blueprint?'\nBlueprint: '+JSON.stringify(blueprint):''}`;
}

export function compileModelingPrompt(prompt){
 const subject=prompt.match(/^Subject: (.*)$/m)?.[1],description=prompt.match(/^Appearance: (.*)$/m)?.[1];
 let palette;try{palette=JSON.parse(prompt.match(/^Palette: (.*)$/m)?.[1]);}catch{throw Error('建模提示词中的配色无效。');}
 if(!subject||!description||!Array.isArray(palette)||palette.length>16||!palette.every(rgb=>Array.isArray(rgb)&&rgb.length===3&&rgb.every(v=>Number.isFinite(v)&&v>=0&&v<=255)))throw Error('建模提示词不完整。');
 let food;const serialized=prompt.match(/^Blueprint: (.*)$/m)?.[1];
 if(serialized){try{food=validateBlueprint(JSON.parse(serialized));}catch{throw Error('建模蓝图无效。');}}
 else food=buildFoodBlueprint(subject,description,palette);
 if(food)return {...food,modelingPrompt:prompt};
 const semantic=identifySubject(subject,description);
 // This constrained compiler owns dimensions and joints; it never executes model-written code.
 const recipe=objectRecipe(semantic,{palette});
 return {...recipe,version:2,engine:'local-vlm+part-grammar',subject,description,modelingPrompt:prompt};
}
