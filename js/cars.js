/** Side-view traffic: lanes are vertical columns and cars move up/down. */
class Vehicle {
  constructor(laneIndex, x, dir, speed, type='sedan') {
    this.laneIndex=laneIndex; this.x=x; this.y=0; this.dir=dir; this.speed=speed; this.baseSpeed=speed; this.type=type;
    const dims={taxi:[62,32,'#ffb300'],sports:[58,30,'#e53935'],suv:[68,34,'#2e7d32'],truck:[94,38,'#eceff1'],sedan:[60,32,'#0288d1']};
    [this.width,this.height,this.color]=dims[type]||dims.sedan;
  }
  update(dt){ this.y += this.speed*this.dir*dt; }
  draw(ctx){
    ctx.save(); ctx.translate(this.x,this.y); ctx.rotate(this.dir>0?Math.PI/2:-Math.PI/2);
    const w=this.width,h=this.height;
    // headlights glow
    const g=ctx.createLinearGradient(w/2,0,w/2+70,0); g.addColorStop(0,'rgba(255,250,210,.42)'); g.addColorStop(1,'rgba(255,250,210,0)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(w/2,-h/2+5); ctx.lineTo(w/2+68,-h/2-12); ctx.lineTo(w/2+68,h/2+12); ctx.lineTo(w/2,h/2-5); ctx.closePath(); ctx.fill();
    ctx.fillStyle='rgba(0,0,0,.45)'; ctx.beginPath(); ctx.roundRect(-w/2-3,-h/2+2,w+6,h,7); ctx.fill();
    ctx.fillStyle=this.color; ctx.strokeStyle='#101823'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(-w/2,-h/2,w,h,7); ctx.fill(); ctx.stroke();
    if(this.type==='sports'){ctx.fillStyle='#fff';ctx.fillRect(-w/2+8,-3,w-16,6);} 
    if(this.type==='taxi'){ctx.fillStyle='#1c1c1c'; for(let x=-w/2+10;x<w/2-10;x+=10) ctx.fillRect(x,-h/2+3,5,4);}
    if(this.type==='truck'){ctx.strokeStyle='#9aa7b3'; for(let x=-w/2+12;x<w/2-24;x+=14){ctx.beginPath();ctx.moveTo(x,-h/2+3);ctx.lineTo(x,h/2-3);ctx.stroke();}}
    ctx.fillStyle='#263238'; ctx.beginPath();ctx.roundRect(w/2-27,-h/2+5,19,h-10,3);ctx.fill();
    ctx.fillStyle='#fff9c4';ctx.fillRect(w/2-2,-h/2+3,3,7);ctx.fillRect(w/2-2,h/2-10,3,7);
    ctx.fillStyle='#ff1744';ctx.fillRect(-w/2-1,-h/2+3,3,7);ctx.fillRect(-w/2-1,h/2-10,3,7);
    ctx.restore();
  }
  getBoundingBox(){ const halfW=this.height/2-3, halfH=this.width/2-5; return {left:this.x-halfW,right:this.x+halfW,top:this.y-halfH,bottom:this.y+halfH}; }
}
class TrafficManager {
  constructor(canvasHeight,laneWidth,totalLanes=24){this.canvasHeight=canvasHeight;this.laneWidth=laneWidth;this.totalLanes=totalLanes;this.vehicles=[];this.laneConfigs=[];this.difficulty='medium';this.initLanes();}
  initLanes(){const types=['sedan','taxi','sports','suv','truck'];for(let i=1;i<=this.totalLanes;i++)this.laneConfigs[i]={dir:(Math.floor((i-1)/2)%2===0)?1:-1,baseSpeed:130+(i*2.2),type:types[i%types.length],spawnInterval:2.4,timer:Math.random()*2};}
  setDifficulty(d){this.difficulty=d; const m={easy:[.78,1.45],medium:[1,1],hard:[1.3,.78],hardcore:[1.65,.62]}[d]||[1,1];for(let i=1;i<=this.totalLanes;i++){const c=this.laneConfigs[i];c.currentSpeed=c.baseSpeed*m[0];c.currentInterval=c.spawnInterval*m[1];}}
  getLaneX(i){return (i+.5)*this.laneWidth;}
  populateInitial(canvasHeight){this.canvasHeight=canvasHeight;this.vehicles=[];for(let i=1;i<=this.totalLanes;i++){const c=this.laneConfigs[i],v=new Vehicle(i,this.getLaneX(i),c.dir,c.currentSpeed||c.baseSpeed,c.type);v.y=80+Math.random()*(canvasHeight-160);this.vehicles.push(v); if(Math.random()>.48){const v2=new Vehicle(i,this.getLaneX(i),c.dir,c.currentSpeed||c.baseSpeed,c.type);v2.y=(v.y+canvasHeight*.55)%canvasHeight;this.vehicles.push(v2);}}}
  update(dt,canvasHeight,barriers,chicken){this.canvasHeight=canvasHeight;for(let i=this.vehicles.length-1;i>=0;i--){const v=this.vehicles[i];v.update(dt);if((v.dir>0&&v.y>canvasHeight+130)||(v.dir<0&&v.y<-130))this.vehicles.splice(i,1);} for(let i=1;i<=this.totalLanes;i++){const c=this.laneConfigs[i];c.timer+=dt;if(c.timer>=(c.currentInterval||c.spawnInterval)){c.timer=0;const types=['sedan','taxi','sports','suv','truck'],type=Math.random()>.35?c.type:types[Math.floor(Math.random()*types.length)];const v=new Vehicle(i,this.getLaneX(i),c.dir,c.currentSpeed||c.baseSpeed,type);v.y=c.dir>0?-110:canvasHeight+110;this.vehicles.push(v);}}}
  draw(ctx){for(const v of this.vehicles)v.draw(ctx);}
  checkCollision(chicken){if(chicken.isDead)return null;const r=chicken.radius*.7,c={left:chicken.x-r,right:chicken.x+r,top:chicken.y-r,bottom:chicken.y+r};for(const v of this.vehicles){const b=v.getBoundingBox();if(c.right>b.left&&c.left<b.right&&c.bottom>b.top&&c.top<b.bottom)return v;}return null;}
}
