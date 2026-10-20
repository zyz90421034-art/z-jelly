import * as T from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

const base = `${import.meta.env.BASE_URL}reference-assets/`;
export const fillY = .0380046;
const palette={
 cherry:['#c00c22','#4f9a22','#6a3a1a','#ff3a3a'],
 mandarinSegment:['#ff9a18','#fff2dc','#ff840e','#ffc458'],
 shiratama:['#f4f0e8','#e2dbd0','#dfe2e6','#ffffff'],
 pineappleChunk:['#ffd63a','#fff09a','#f0a818','#ffe468'],
 mangoCube:['#ffb418','#ffca3c','#ff900c','#ffe07e'],
 kiwiPiece:['#78be26','#eef0c4','#1c180c','#b6e05e'],
 peachSlice:['#ffe6da','#ffa8b6','#a8082e','#ff3f73'],
};
function radiusAt(profile,y){let r=0;for(let i=1;i<profile.length;i++){const[a,b]=profile[i-1],[c,d]=profile[i];if(y>=b&&y<=d&&d>b)r=Math.max(r,T.MathUtils.lerp(a,c,(y-b)/(d-b)));}return r||profile.at(-1)[0];}
function liquidGeometry(profile,low,high){
 const segments=128,rings=40,positions=[],uvs=[],indices=[];
 // Lower side, side wall, meniscus, then many concentric top rings.
 const path=[[0,low],[radiusAt(profile,low)-.00045,low]];
 for(let i=1;i<=18;i++){const y=T.MathUtils.lerp(low,high-.001,i/18);path.push([radiusAt(profile,y)-.00045,y]);}
 const r=radiusAt(profile,high)-.00045;
 for(let i=0;i<=8;i++){const t=i/8;path.push([r-.002*t,high+.0008*(1-t)**3]);}
 for(let i=1;i<=rings;i++)path.push([(r-.002)*(1-i/rings),high]);
 for(let row=0;row<path.length;row++)for(let col=0;col<=segments;col++){
  const a=col/segments*Math.PI*2,[r,y]=path[row];positions.push(r*Math.cos(a),y,r*Math.sin(a));uvs.push(col/segments,row/(path.length-1));
 }
 for(let row=0;row<path.length-1;row++)for(let col=0;col<segments;col++){const a=row*(segments+1)+col,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));g.setIndex(indices);g.computeVertexNormals();return g;
}
const vertex=`varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;void main(){vLocal=position;vUv=uv;vWorld=(modelMatrix*vec4(position,1.)).xyz;vNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*viewMatrix*vec4(vWorld,1.);}`;
const opticalFragment=`
uniform sampler2D backdrop;uniform sampler2D normalMap;uniform vec2 resolution;uniform float kind;uniform float paint;uniform vec3 tint;uniform vec3 absorption;uniform float distanceScale;uniform vec3 cameraLocal;uniform float cupRadius;
varying vec2 vUv;varying vec3 vWorld;varying vec3 vNormal;varying vec3 vLocal;
vec3 paintedNormal(){vec3 q1=dFdx(vWorld),q2=dFdy(vWorld);vec2 st1=dFdx(vUv),st2=dFdy(vUv);vec3 n=normalize(vNormal);vec3 s=normalize(q1*st2.t-q2*st1.t);vec3 t=normalize(-q1*st2.s+q2*st1.s);vec3 m=texture2D(normalMap,vUv).xyz*2.-1.;m.xy*=paint;return normalize(mat3(s,t,n)*m);}
void main(){vec3 n=paintedNormal();vec3 view=normalize(cameraPosition-vWorld);if(dot(n,view)<0.)n=-n;
 float facing=clamp(dot(n,view),0.,1.),fresnel=pow(1.-facing,3.);vec3 nv=normalize(mat3(viewMatrix)*n);vec2 uv=gl_FragCoord.xy/resolution;
 float liquid=1.-step(.5,kind);vec3 localView=normalize(cameraLocal-vLocal);float horizontalLength=length(localView.xz);vec2 ray=localView.xz/max(horizontalLength,.00001);float impact2=max(0.,dot(vLocal.xz,vLocal.xz)-pow(dot(vLocal.xz,ray),2.));float chord=2.*sqrt(max(0.,cupRadius*cupRadius-impact2));float thickness=liquid*clamp(chord/max(horizontalLength,.2),.002,.075)+.002*(1.-liquid);
 vec2 off=nv.xy*(liquid*.018+.005)*(1.-facing*.65);vec2 edge=clamp(uv+off,vec2(.002),vec2(.998));
 vec3 color; color.r=texture2D(backdrop,edge+off*.11).r;color.g=texture2D(backdrop,edge).g;color.b=texture2D(backdrop,edge-off*.11).b;
 vec3 transmit=pow(max(absorption,vec3(.001)),vec3(thickness/max(distanceScale,.001)));color*=mix(vec3(1.),transmit,liquid*.75);
 color=mix(color,color*tint,.06+liquid*.06);vec3 warm=vec3(.87,.67,.92);color+=warm*(.015+fresnel*.13)*(1.-liquid*.6);
 vec3 h=normalize(view+normalize(vec3(-.55,.8,-.4)));float spec=pow(max(dot(n,h),0.),liquid>0.?85.:125.);color+=vec3(1.,.88,.79)*spec*.10;
 float stroke=texture2D(normalMap,vUv).r;color+=fresnel*(stroke-.5)*.32;gl_FragColor=vec4(color,1.);
}`;
function optics(map,kind){return new T.ShaderMaterial({vertexShader:vertex,fragmentShader:opticalFragment,uniforms:{cameraLocal:{value:new T.Vector3()},cupRadius:{value:.043},backdrop:{value:null},normalMap:{value:map},resolution:{value:new T.Vector2()},kind:{value:kind},paint:{value:kind?.67:.12},tint:{value:new T.Color(kind?'#ffffff':'#fff0ec')},absorption:{value:new T.Color(kind?'#efe4ff':'#e86dff')},distanceScale:{value:kind?.25:.094}},side:T.FrontSide,depthWrite:true});}
function makeFruit(source,type,map){
 const geometry=source.geometry.clone(),masks=geometry.getAttribute('color'),colors=[];const p=palette[type]||palette.cherry;
 const c=p.map(x=>new T.Color(x)),out=new T.Color();
 for(let i=0;i<geometry.attributes.position.count;i++){
  out.copy(c[0]);if(masks){out.lerp(c[1],masks.getX(i));out.lerp(c[2],masks.getY(i));out.lerp(c[3],masks.getZ(i));out.multiplyScalar(.9+masks.getW(i)*.2);}colors.push(out.r,out.g,out.b);
 }
 geometry.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 const material=new T.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,normalMap:map,normalScale:new T.Vector2(.6,.6),roughness:type==='shiratama'?.42:.36,metalness:0,specularIntensity:.22,envMapIntensity:.08,clearcoat:0,sheen:.12,sheenColor:new T.Color(p[0]),emissive:new T.Color(p[0]),emissiveIntensity:.025});
 material.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nfloat paintedFacing=clamp(dot(normalize(vNormal),normalize(vViewPosition)),0.,1.);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*diffuseColor.rgb*1.15,paintedFacing*paintedFacing);');};
 return new T.Mesh(geometry,material);
}

const environmentColor=`
float envHash(vec3 p){p=fract(p*.3183099+vec3(.13,.37,.71));p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
float envNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(envHash(i),envHash(i+vec3(1,0,0)),f.x),mix(envHash(i+vec3(0,1,0)),envHash(i+vec3(1,1,0)),f.x),f.y),mix(mix(envHash(i+vec3(0,0,1)),envHash(i+vec3(1,0,1)),f.x),mix(envHash(i+vec3(0,1,1)),envHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
float envCloud(vec3 p){return envNoise(p)*.58+envNoise(p*2.03+vec3(5.7,1.3,9.2))*.28+envNoise(p*4.11+vec3(1.2,8.4,3.6))*.14;}
vec3 environmentColor(vec3 d){
 vec3 p=d*2.4+vec3(3.1,8.7,1.4);
 vec3 warp=vec3(envCloud(p+vec3(2.1,0,3.7)),envCloud(p+vec3(7.3,4.8,0)),envCloud(p+vec3(0,9.1,5.2)))-.5;
 p+=warp*2.6;
 float violet=smoothstep(.25,.73,envCloud(p));
 float rose=smoothstep(.4,.78,envCloud(p*.82+vec3(8.3,2.9,6.4)))*.5;
 float haze=smoothstep(.32,.8,envCloud(p*1.3+vec3(1.7,6.2,4.3)));
 vec3 c=mix(vec3(.19,.46,.59),vec3(.43,.31,.52),violet);
 c=mix(c,vec3(.52,.34,.46),rose);
 c=mix(c,vec3(.40,.52,.59),haze*.28);
 // World-anchored, isotropic wax crumbs: no long parallel streaks.
 vec3 r=d*vec3(1.03,.97,1.01)+vec3(4.1,8.3,2.7);
 vec3 scuff=vec3(envNoise(r*32.),envNoise(r*32.+7.3),envNoise(r*32.+16.1))-.5;
 float crumbs=envNoise(r*155.+scuff*.9);
 float tooth=envNoise(r*315.+vec3(1.7,5.8,9.3));
 float brokenWax=envNoise(r*95.+scuff*1.4+vec3(6.2,1.4,3.9));
 float bare=smoothstep(.57,.82,tooth*.64+crumbs*.36);
 c*=.95+(crumbs-.5)*.14+(brokenWax-.5)*.08;
 c=mix(c,vec3(.72,.72,.65),bare*.38);
 return c;
}`;
function addStudio(scene){
 const vertex=`varying vec3 world;void main(){world=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(world,1.);}`;
 const sky=new T.Mesh(new T.SphereGeometry(1.5,48,24),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:vertex,fragmentShader: environmentColor+`varying vec3 world;void main(){gl_FragColor=vec4(environmentColor(normalize(world)),1.);}`}));scene.add(sky);
 const ground=new T.Mesh(new T.PlaneGeometry(2,2),new T.ShaderMaterial({transparent:true,depthWrite:false,uniforms:{shadowCenter:{value:new T.Vector2()}},vertexShader:vertex,fragmentShader:`varying vec3 world;uniform vec2 shadowCenter;void main(){vec2 p=world.xz-shadowCenter;vec2 s=(p-vec2(-.024,.011))/vec2(.067,.047);float shade=exp(-dot(s,s)*2.)*.24+exp(-dot(p/.031,p/.031)*3.)*.12;gl_FragColor=vec4(.31,.23,.48,shade);}`}));ground.rotation.x=-Math.PI/2;ground.position.y=-.0002;scene.add(ground);return ground;
}
function addSpatialStars(scene){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const ctx=canvas.getContext('2d');
 const glow=ctx.createRadialGradient(64,64,0,64,64,60);glow.addColorStop(0,'rgba(255,244,206,.8)');glow.addColorStop(.12,'rgba(255,244,206,.35)');glow.addColorStop(1,'rgba(255,244,206,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,128,128);
 ctx.fillStyle='#fff3d1';ctx.beginPath();ctx.moveTo(64,10);ctx.quadraticCurveTo(68,58,111,64);ctx.quadraticCurveTo(68,69,64,118);ctx.quadraticCurveTo(59,69,17,64);ctx.quadraticCurveTo(59,58,64,10);ctx.fill();
 const texture=new T.CanvasTexture(canvas),group=new T.Group();group.rotation.y=T.MathUtils.degToRad(113.5);scene.add(group);
 const positions=[[-.087,.086,-.025],[.085,.058,-.015],[-.065,.018,.014],[.092,.006,.04],[.028,.10,-.07],[-.13,.065,-.12],[.13,.11,-.15],[-.036,.085,-.10],[.07,.022,-.11],[-.10,-.002,-.06]];
 for(let i=0;i<positions.length;i++){const material=new T.SpriteMaterial({map:texture,color:'#fff0ce',transparent:true,opacity:.68,depthWrite:false,toneMapped:false});const sprite=new T.Sprite(material);sprite.position.fromArray(positions[i]);sprite.scale.setScalar(.004+(i%3)*.0015);sprite.userData.phase=i*.77;group.add(sprite);}
 return group;
}
export async function createArtwork(renderer,scene){
 const loader=new GLTFLoader(),textures=new T.TextureLoader();
 const [model,fruitModel,cupNormal,lidNormal,fruitNormal,layout]=await Promise.all([loader.loadAsync(base+'cup_p4.glb'),loader.loadAsync(base+'fruits.glb'),textures.loadAsync(base+'cup9_p4_normal.webp'),textures.loadAsync(base+'lid9_p4_normal.webp'),textures.loadAsync(base+'fruit_normal.webp'),fetch(base+'layout-p4.json').then(r=>r.json())]);
 const [secondModel,secondCupNormal,secondLidNormal,secondLayout]=await Promise.all([loader.loadAsync(base+'cup_p7.glb'),textures.loadAsync(base+'cup9_p7_normal.webp'),textures.loadAsync(base+'lid9_p7_normal.webp'),fetch(base+'layout-p7.json').then(r=>r.json())]);
 for(const texture of [cupNormal,lidNormal,fruitNormal,secondCupNormal,secondLidNormal]){texture.flipY=false;texture.colorSpace=T.NoColorSpace;texture.anisotropy=renderer.capabilities.getMaxAnisotropy();}
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment();scene.environment=pmrem.fromScene(room,.04).texture;room.dispose();pmrem.dispose();
 scene.background=new T.Color('#d3a5d7');
 const ambient=new T.HemisphereLight('#b096c2','#ffabab',.98);scene.add(ambient);
 const key=new T.DirectionalLight('#ffdcbd',3.2);key.position.set(-.16,.24,-.12);scene.add(key);
 const rim=new T.DirectionalLight('#b68bff',.85);rim.position.set(.16,.04,.08);scene.add(rim);
 const ground=addStudio(scene);
 const stars=addSpatialStars(scene);

 const cup=new T.Group();scene.add(cup);const prototypes=fruitModel.scene.getObjectByName('FruitPrototypes');const themes={};
 function buildTheme(model,id,normal,lidMap,layout,green){
  const root=new T.Group();cup.add(root);const pkg=model.scene.getObjectByName('Pkg_'+id),extras=pkg.userData;root.add(pkg);
  const body=pkg.getObjectByName('Cup_'+id),lid=pkg.getObjectByName('Lid_'+id);body.material=optics(normal,1);lid.material=optics(lidMap,1);body.layers.set(2);lid.layers.set(2);body.renderOrder=4;lid.renderOrder=5;
  const top=green?.065:fillY,low=extras.cavityProfile[0][1],creamHeight=low+(top-low)*.31;
  const creamMat=new T.MeshPhysicalMaterial({color:green?'#d7eaa4':'#ffcbb2',roughness:.4,normalMap:fruitNormal,normalScale:new T.Vector2(.18,.18),sheen:.5,sheenColor:new T.Color('#ffe8d7'),emissive:green?'#b6c27d':'#ee8c72',emissiveIntensity:.13,envMapIntensity:.2});
  const cream=new T.Mesh(liquidGeometry(extras.cavityProfile,low,creamHeight),creamMat);root.add(cream);
  const jelly=new T.Mesh(liquidGeometry(extras.cavityProfile,creamHeight,top),optics(normal,0));jelly.layers.set(1);jelly.renderOrder=2;root.add(jelly);jelly.frustumCulled=false;
  jelly.material.uniforms.cupRadius.value=radiusAt(extras.cavityProfile,top);
  jelly.material.uniforms.absorption.value.set(green?'#b7da7c':'#e86dff');
  const fruitGroup=new T.Group();root.add(fruitGroup);const fruits=[];
  for(const piece of layout){const proto=prototypes.getObjectByName('FruitProto_'+piece.type);if(!proto)continue;const f=makeFruit(proto,piece.type,fruitNormal);f.position.fromArray(piece.position);f.quaternion.fromArray(piece.quaternion);f.scale.setScalar(piece.scale);f.userData={rest:f.position.clone(),quaternion:f.quaternion.clone(),type:piece.type,lag:new T.Vector3(),velocity:new T.Vector3()};fruitGroup.add(f);fruits.push(f);}
  return {root,jelly,cream,body,lid,fruits,extras,fillY:top,bottom:low,radius:radiusAt(extras.cavityProfile,top)};
 }
 themes.berry=buildTheme(model,'P4',cupNormal,lidNormal,layout,false);themes.matcha=buildTheme(secondModel,'P7',secondCupNormal,secondLidNormal,secondLayout,true);
 const result={cup,ground,stars,themes,setFlavor(flavor){const theme=themes[flavor]||themes.berry;for(const value of Object.values(themes))value.root.visible=value===theme;Object.assign(result,theme);return result;}};
 result.setFlavor('berry');return result;
}

const quadVertex=`varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}`;
export function createPaintingPipeline(renderer,scene,camera,art){
 const makeTarget=()=>new T.WebGLRenderTarget(512,512,{type:T.HalfFloatType,depthBuffer:true,samples:Math.min(4,renderer.capabilities.maxSamples)});
 const opaque=makeTarget(),liquid=makeTarget(),glass=makeTarget(),screen=new T.Scene(),ortho=new T.OrthographicCamera(-1,1,1,-1,0,1);
 const localCamera=new T.Vector3();
 const uniforms={image:{value:glass.texture},resolution:{value:new T.Vector2(800,800)}};
 const shader=new T.ShaderMaterial({uniforms,vertexShader:quadVertex,fragmentShader:`uniform sampler2D image;uniform vec2 resolution;varying vec2 vUv;
 float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
 void main(){
 vec3 c=texture2D(image,vUv).rgb;
 vec3 outc=mix(c,pow(max(c,vec3(0.)),vec3(1.04)),.25);
 outc=mix(outc,vec3(.68,.56,.61),.085);
 gl_FragColor=vec4(outc,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`});screen.add(new T.Mesh(new T.PlaneGeometry(2,2),shader));
 return {resize(w,h){const ratio=renderer.getPixelRatio(),x=Math.round(w*ratio),y=Math.round(h*ratio);for(const t of [opaque,liquid,glass])t.setSize(x,y);uniforms.resolution.value.set(x,y);scene.traverse(object=>{if(object.material?.uniforms?.resolution)object.material.uniforms.resolution.value.set(x,y);});},render(){
  art.cup.updateWorldMatrix(true,false);camera.getWorldPosition(localCamera);art.cup.worldToLocal(localCamera);
  for(const mesh of [art.jelly,art.body,art.lid])mesh.material.uniforms.cameraLocal.value.copy(localCamera);
  camera.layers.set(0);renderer.setRenderTarget(opaque);renderer.render(scene,camera);
  art.jelly.material.uniforms.backdrop.value=opaque.texture;camera.layers.enable(1);renderer.setRenderTarget(liquid);renderer.render(scene,camera);
  art.body.material.uniforms.backdrop.value=liquid.texture;art.lid.material.uniforms.backdrop.value=liquid.texture;camera.layers.enable(2);renderer.setRenderTarget(glass);renderer.render(scene,camera);
  renderer.setRenderTarget(null);renderer.render(screen,ortho);
 },dispose(){for(const t of [opaque,liquid,glass])t.dispose();shader.dispose();}};
}
