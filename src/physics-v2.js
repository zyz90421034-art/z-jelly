// Independent volumetric displacement lattice. Units: meters, seconds.
// Vector shear springs + cell divergence penalty + bonded vessel boundaries.
export class JellyVolume {
  constructor({resolution=10,radius=.027,height=.047,bottom=.006,frequency=3,damping=.2,adhesion=.92,response=.8,maxDisplacement=.006}={}){
    Object.assign(this,{n:resolution,radius,height,bottom,frequency,damping,adhesion,response,maxDisplacement});const n=this.n,count=n*n*n;
    this.u=new Float64Array(count*3);this.v=new Float64Array(count*3);this.force=new Float64Array(count*3);this.rest=new Float64Array(count*3);this.active=new Uint8Array(count);this.glue=new Float64Array(count);this.edges=[];this.cells=[];
    this.h=[2*radius/(n-1),height/(n-1),2*radius/(n-1)];this.peak=0;this.speed=0;
    for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const id=this.id(x,y,z),i=id*3,px=-radius+x*this.h[0],py=bottom+y*this.h[1],pz=-radius+z*this.h[2],r=radius*(.86+.14*y/(n-1));this.rest.set([px,py,pz],i);this.active[id]=Math.hypot(px,pz)<=r+this.h[0]*.35?1:0;const wall=1-Math.max(0,Math.min(1,(r-Math.hypot(px,pz))/this.h[0]));this.glue[id]=Math.max(y===0?1:0,wall*adhesion);}
    for(let z=0;z<n;z++)for(let y=0;y<n;y++)for(let x=0;x<n;x++){const a=this.id(x,y,z);if(!this.active[a])continue;for(const[dx,dy,dz]of[[1,0,0],[0,1,0],[0,0,1]]){if(x+dx>=n||y+dy>=n||z+dz>=n)continue;const b=this.id(x+dx,y+dy,z+dz);if(this.active[b])this.edges.push([a,b]);}
      if(x<n-1&&y<n-1&&z<n-1){const corners=[];for(let k=0;k<8;k++)corners.push(this.id(x+(k&1),y+((k>>1)&1),z+((k>>2)&1)));if(corners.every(c=>this.active[c]))this.cells.push(corners);}}
  }
  id(x,y,z){return x+this.n*(y+this.n*z);}
  reset(){this.u.fill(0);this.v.fill(0);this.peak=this.speed=0;}
  update(dt,motion={}){
    dt=Math.max(0,Math.min(.05,dt));const substeps=Math.max(8,Math.ceil(dt/.0008)),h=dt/substeps,w=2*Math.PI*this.frequency,k=w*w*3.6,c=2*this.damping*w;
    const arr=v=>v?Array.isArray(v)||ArrayBuffer.isView(v)?v:[v.x,v.y,v.z]:[0,0,0];const a=arr(motion.acceleration),g=motion.gravity?arr(motion.gravity):[0,-9.81,0],omega=arr(motion.angularVelocity),alpha=arr(motion.angularAcceleration);
    for(let s=0;s<substeps;s++){
      this.force.fill(0);
      for(let id=0;id<this.active.length;id++){if(!this.active[id])continue;const i=id*3,x=this.rest[i]+this.u[i],y=this.rest[i+1]+this.u[i+1],z=this.rest[i+2]+this.u[i+2],vx=this.v[i],vy=this.v[i+1],vz=this.v[i+2];
        const cx=omega[1]*z-omega[2]*y,cy=omega[2]*x-omega[0]*z,cz=omega[0]*y-omega[1]*x;
        this.force[i]=this.response*(-a[0]+g[0])-(alpha[1]*z-alpha[2]*y)-(omega[1]*cz-omega[2]*cy)-2*(omega[1]*vz-omega[2]*vy);
        this.force[i+1]=this.response*(-a[1]+g[1]+9.81)-(alpha[2]*x-alpha[0]*z)-(omega[2]*cx-omega[0]*cz)-2*(omega[2]*vx-omega[0]*vz);
        this.force[i+2]=this.response*(-a[2]+g[2])-(alpha[0]*y-alpha[1]*x)-(omega[0]*cy-omega[1]*cx)-2*(omega[0]*vy-omega[1]*vx);
      }
      for(const[a,b]of this.edges){for(let d=0;d<3;d++){const i=a*3+d,j=b*3+d,f=k*(this.u[j]-this.u[i])+.012*k*(this.v[j]-this.v[i]);this.force[i]+=f;this.force[j]-=f;}}
      // Quadratic divergence energy: resist volume changes while allowing shear.
      for(const cell of this.cells){let div=0;for(let c=0;c<8;c++){const i=cell[c]*3;for(let d=0;d<3;d++)div+=((c>>d)&1?1:-1)*this.u[i+d]/(4*this.h[d]);}for(let c=0;c<8;c++){const i=cell[c]*3;for(let d=0;d<3;d++)this.force[i+d]-=k*.65*this.h[d]*div*((c>>d)&1?1:-1)/4;}}
      for(let id=0;id<this.active.length;id++){if(!this.active[id])continue;const i=id*3,glue=this.glue[id];for(let d=0;d<3;d++){if(glue>=.999){this.u[i+d]=this.v[i+d]=0;continue;}const kg=w*w*(.12+glue*16),damp=c+glue*20;this.v[i+d]=(this.v[i+d]+h*(this.force[i+d]-kg*this.u[i+d]))/(1+h*damp);this.u[i+d]+=h*this.v[i+d];}
        const len=Math.hypot(this.u[i],this.u[i+1],this.u[i+2]);if(len>this.maxDisplacement){const t=this.maxDisplacement/len;for(let d=0;d<3;d++){this.u[i+d]*=t;this.v[i+d]*=.5;}}
      }
    }
    this.peak=0;this.speed=0;for(let i=0;i<this.u.length;i+=3){this.peak=Math.max(this.peak,Math.hypot(this.u[i],this.u[i+1],this.u[i+2]));this.speed=Math.max(this.speed,Math.hypot(this.v[i],this.v[i+1],this.v[i+2]));}
    const excitation=Math.hypot(...a)+Math.hypot(g[0],g[1]+9.81,g[2])+Math.hypot(...omega)+Math.hypot(...alpha);
    if(excitation<1e-5&&this.peak<1e-6&&this.speed<1e-5)this.reset();
    return this;
  }
  // Trilinear displacement; out may be a mutable [x,y,z] or a THREE.Vector3.
  sample(x,y,z,out=[0,0,0]){const coords=[(x+this.radius)/this.h[0],(y-this.bottom)/this.h[1],(z+this.radius)/this.h[2]],base=coords.map(v=>Math.max(0,Math.min(this.n-2,Math.floor(v)))),f=coords.map((v,i)=>Math.max(0,Math.min(1,v-base[i]))),value=[0,0,0];let weight=0;
    for(let k=0;k<8;k++){const xx=k&1,yy=(k>>1)&1,zz=(k>>2)&1,id=this.id(base[0]+xx,base[1]+yy,base[2]+zz);if(!this.active[id])continue;const w=(xx?f[0]:1-f[0])*(yy?f[1]:1-f[1])*(zz?f[2]:1-f[2]);weight+=w;for(let d=0;d<3;d++)value[d]+=this.u[id*3+d]*w;}
    if(weight)for(let d=0;d<3;d++)value[d]/=weight;if(out.set)out.set(...value);else for(let d=0;d<3;d++)out[d]=value[d];return out;}
}
