import * as THREE from 'three';

// Meter-scale cup motion: horizontal grab plane, bounded soft follow and rocking.
export class CupInteraction {
  constructor({canvas,camera,cup,controls,hitObject=cup,maxOffset=.03,baseRadius=.023,onWake=()=>{}}) {
    Object.assign(this,{canvas,camera,cup,controls,hitObject,maxOffset,baseRadius,onWake});
    this.origin=cup.position.clone(); this.baseQuaternion=cup.quaternion.clone();
    this.offset=new THREE.Vector3();this.velocity=new THREE.Vector3();this.acceleration=new THREE.Vector3();this.target=new THREE.Vector3();
    this.tilt=new THREE.Vector2();this.tiltVelocity=new THREE.Vector2();this.angularVelocity=new THREE.Vector3();this.angularAcceleration=new THREE.Vector3();
    this.motion={acceleration:new THREE.Vector3(),angularVelocity:new THREE.Vector3(),angularAcceleration:new THREE.Vector3(),gravity:new THREE.Vector3(0,-9.81,0)};
    this.ray=new THREE.Raycaster();this.ray.layers.enableAll();this.ndc=new THREE.Vector2();this.plane=new THREE.Plane();this.hit=new THREE.Vector3();this.grab=new THREE.Vector3();this.shakeTime=2;this.shakeCount=0;this.dragging=false;
    this.handlers={pointerdown:e=>this.down(e),pointermove:e=>this.move(e),pointerup:e=>this.up(e),pointercancel:e=>this.up(e),lostpointercapture:e=>this.up(e)};
    for(const [name,handler]of Object.entries(this.handlers))canvas.addEventListener(name,handler,{capture:name==='pointerdown'});
    this.key=e=>{if(e.key?.toLowerCase()==='s'&&!e.repeat&&!e.ctrlKey&&!e.metaKey&&!e.target?.closest?.('input,textarea,select'))this.shake();};
    window.addEventListener('keydown',this.key);
  }
  cast(e){const b=this.canvas.getBoundingClientRect();this.ndc.set((e.clientX-b.left)/b.width*2-1,1-(e.clientY-b.top)/b.height*2);this.ray.setFromCamera(this.ndc,this.camera);}
  down(e){if(e.button!==0||this.dragging)return;this.cast(e);this.cup.updateWorldMatrix(true,true);const hit=this.ray.intersectObject(this.hitObject,true)[0];if(!hit)return;
    e.preventDefault();e.stopImmediatePropagation();this.dragging=true;this.pointerId=e.pointerId;this.plane.set(new THREE.Vector3(0,1,0),-hit.point.y);this.grab.copy(hit.point).sub(this.cup.position);this.target.copy(this.offset);this.shakeTime=2;
    if(this.controls){this.controlsEnabled=this.controls.enabled;this.controls.enabled=false;}this.canvas.setPointerCapture(e.pointerId);this.canvas.dataset.cup='held';this.onWake();}
  move(e){this.cast(e);if(!this.dragging){this.canvas.style.cursor=this.ray.intersectObject(this.hitObject,true).length?'grab':'';return;}if(e.pointerId!==this.pointerId)return;
    if(this.ray.ray.intersectPlane(this.plane,this.hit)){this.target.copy(this.hit).sub(this.grab).sub(this.origin).setY(0);const length=this.target.length();if(length)this.target.multiplyScalar(this.maxOffset*Math.tanh(length/this.maxOffset)/length);}this.onWake();}
  up(e){if(!this.dragging||e.pointerId!==this.pointerId)return;this.dragging=false;if(this.controls)this.controls.enabled=this.controlsEnabled;delete this.canvas.dataset.cup;try{this.canvas.releasePointerCapture(e.pointerId);}catch{}this.onWake();}
  shake(){this.shakeTime=0;this.shakeCount++;this.camera.getWorldDirection(this.hit).setY(0).normalize();this.shakeDirection=new THREE.Vector3().crossVectors(this.hit,new THREE.Vector3(0,1,0)).normalize().applyAxisAngle(new THREE.Vector3(0,1,0),this.shakeCount%2?.26:-.26);this.onWake();}
  update(dt){dt=Math.min(.05,Math.max(0,dt));if(!dt)return this.motion;const prevV=this.velocity.clone(),prevW=this.angularVelocity.clone(),h=dt/8,a=new THREE.Vector3();
    for(let i=0;i<8;i++){this.shakeTime+=h;const shaking=this.shakeTime<1.2,active=this.dragging||shaking,w=2*Math.PI*(active?7:2.2),damping=active?.9:.55;
      if(!this.dragging){this.target.set(0,0,0);if(shaking){const t=this.shakeTime,smooth=x=>{x=THREE.MathUtils.clamp(x,0,1);return x*x*(3-2*x);};this.target.copy(this.shakeDirection).multiplyScalar(.011*smooth(t/.12)*smooth((1.2-t)/.48)*Math.sin(2*Math.PI*3.2*t));}}
      a.copy(this.target).sub(this.offset).multiplyScalar(w*w).addScaledVector(this.velocity,-2*damping*w).clampLength(0,28);this.velocity.addScaledVector(a,h).clampLength(0,1.2);this.offset.addScaledVector(this.velocity,h);
      const maxTilt=THREE.MathUtils.degToRad(3),tx=THREE.MathUtils.clamp(a.x*maxTilt/10,-maxTilt,maxTilt),tz=THREE.MathUtils.clamp(a.z*maxTilt/10,-maxTilt,maxTilt),tw=2*Math.PI*3;
      this.tiltVelocity.x+=(tw*tw*(tx-this.tilt.x)-2*.35*tw*this.tiltVelocity.x)*h;this.tiltVelocity.y+=(tw*tw*(tz-this.tilt.y)-2*.35*tw*this.tiltVelocity.y)*h;this.tilt.addScaledVector(this.tiltVelocity,h);this.tilt.clampLength(0,maxTilt*1.5);
    }
    // Settle residual motion below visible scale, including while holding still.
    if(this.shakeTime>=1.2&&this.offset.distanceToSquared(this.target)<1e-12&&this.velocity.lengthSq()<1e-10&&this.tilt.lengthSq()<1e-10&&this.tiltVelocity.lengthSq()<1e-8){
      this.offset.copy(this.target);this.velocity.set(0,0,0);this.tilt.set(0,0);this.tiltVelocity.set(0,0);prevV.set(0,0,0);prevW.set(0,0,0);
    }
    this.acceleration.copy(this.velocity).sub(prevV).divideScalar(dt).clampLength(0,28);this.angularVelocity.set(this.tiltVelocity.y,0,-this.tiltVelocity.x);this.angularAcceleration.copy(this.angularVelocity).sub(prevW).divideScalar(dt).clampLength(0,400);
    const length=this.tilt.length(),axis=new THREE.Vector3(this.tilt.y,0,-this.tilt.x);if(length)axis.divideScalar(length);else axis.set(1,0,0);const q=new THREE.Quaternion().setFromAxisAngle(axis,length);
    const pivot=new THREE.Vector3(this.tilt.x,0,this.tilt.y);if(length)pivot.multiplyScalar(this.baseRadius/length);this.cup.position.copy(this.origin).add(this.offset).add(pivot).sub(pivot.clone().applyQuaternion(q));this.cup.quaternion.copy(q).multiply(this.baseQuaternion);
    const inverse=this.cup.quaternion.clone().invert();this.motion.acceleration.copy(this.acceleration).applyQuaternion(inverse);this.motion.angularVelocity.copy(this.angularVelocity).applyQuaternion(inverse);this.motion.angularAcceleration.copy(this.angularAcceleration).applyQuaternion(inverse);this.motion.gravity.set(0,-9.81,0).applyQuaternion(inverse);return this.motion;
  }
  dispose(){for(const[name,handler]of Object.entries(this.handlers))this.canvas.removeEventListener(name,handler,{capture:name==='pointerdown'});window.removeEventListener('keydown',this.key);}
}
