const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".desktop-nav");

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });

  nav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    });
  });
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", event => {
    const href = link.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
    history.replaceState(null, "", href);
  });
});

const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();



/* Interactive quantum-inspired visualisation. This is an illustrative browser model, not a quantum simulator. */
(() => {
  const canvas = document.querySelector(".quantum-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;
  const stage = canvas.closest(".quantum-stage");
  const pauseButton = stage.querySelector(".motion-toggle");
  const resetButton = stage.querySelector(".motion-reset");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { yaw: -.32, pitch: -.2, spin: 0, paused: reduceMotion.matches, dragging: false, px: 0, py: 0, width: 1, height: 1, dpr: 1, last: 0 };
  let stars = [];
  const orbits = [
    {a:1.0,b:.31,yaw:.16,pitch:.14,roll:-.52,color:"#d9b16d",alpha:.82,width:1.45,glow:3},
    {a:.91,b:.34,yaw:1.0,pitch:-.25,roll:.52,color:"#c8d9d1",alpha:.74,width:1.1,glow:2},
    {a:.84,b:.4,yaw:-.16,pitch:.13,roll:1.52,color:"#e4a34c",alpha:.9,width:1.35,glow:4},
    {a:.72,b:.25,yaw:.75,pitch:.7,roll:-.92,color:"#7ab5b2",alpha:.52,width:.9,glow:2},
    {a:1.06,b:.2,yaw:.55,pitch:-.54,roll:.1,color:"#e5d2a1",alpha:.35,width:.7,glow:1}
  ];
  const particles = Array.from({length:110},(_,i)=>({orbit:i%orbits.length,t:(i*2.399963)% (Math.PI*2),r:i%13===0?1.8:.65+(i%4)*.24,alpha:.22+(i%7)*.1}));
  function resize(){
    const r=stage.getBoundingClientRect(); state.width=Math.max(1,r.width);state.height=Math.max(1,r.height);state.dpr=Math.min(devicePixelRatio||1,2);
    canvas.width=Math.round(state.width*state.dpr);canvas.height=Math.round(state.height*state.dpr);ctx.setTransform(state.dpr,0,0,state.dpr,0,0);
    stars=Array.from({length:Math.floor(state.width*state.height/1150)},(_,i)=>({x:Math.random()*state.width,y:Math.random()*state.height,r:Math.random()*.9+.2,a:Math.random()*.28+.035,phase:Math.random()*6.28}));
  }
  if("ResizeObserver"in window)new ResizeObserver(resize).observe(stage);else addEventListener("resize",resize);resize();
  function rotate(p,yaw,pitch,roll){
    let x=p.x*Math.cos(roll)-p.y*Math.sin(roll),y=p.x*Math.sin(roll)+p.y*Math.cos(roll),z=p.z||0;
    const x1=x*Math.cos(yaw)+z*Math.sin(yaw),z1=-x*Math.sin(yaw)+z*Math.cos(yaw);
    const y1=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch);
    const x2=x1*Math.cos(state.yaw)+z2*Math.sin(state.yaw),z3=-x1*Math.sin(state.yaw)+z2*Math.cos(state.yaw);
    const y2=y1*Math.cos(state.pitch)-z3*Math.sin(state.pitch),z4=y1*Math.sin(state.pitch)+z3*Math.cos(state.pitch);
    const persp=2.65/(2.65-z4*.34),scale=Math.min(state.width,state.height)*.365;
    return{x:state.width*.5+x2*scale*persp,y:state.height*.48+y2*scale*persp,z:z4,persp};
  }
  function orbitPoint(d,t){return rotate({x:Math.cos(t)*d.a,y:Math.sin(t)*d.b,z:0},d.yaw,d.pitch,d.roll);}
  function drawBackground(time){
    const w=state.width,h=state.height,cx=w*.5,cy=h*.48;
    const haze=ctx.createRadialGradient(cx,cy,0,cx,cy,Math.min(w,h)*.52);
    haze.addColorStop(0,"rgba(172,119,53,.11)");haze.addColorStop(.42,"rgba(67,102,87,.075)");haze.addColorStop(1,"rgba(6,15,11,0)");
    ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
    for(const s of stars){ctx.globalAlpha=s.a*(.8+.2*Math.sin(time*.0005+s.phase));ctx.fillStyle=s.phase>4?"#b6d4ce":"#f0d6a2";ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();}
    ctx.globalAlpha=1;
    const vignette=ctx.createRadialGradient(cx,cy,Math.min(w,h)*.22,cx,cy,Math.min(w,h)*.68);
    vignette.addColorStop(0,"rgba(0,0,0,0)");vignette.addColorStop(1,"rgba(2,8,6,.24)");ctx.fillStyle=vignette;ctx.fillRect(0,0,w,h);
  }
  function drawGrid(){
    const cx=state.width*.5,cy=state.height*.48,r=Math.min(state.width,state.height)*.405;
    ctx.save();ctx.strokeStyle="rgba(205,220,207,.13)";ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(cx-r*1.45,cy);ctx.lineTo(cx+r*1.45,cy);ctx.moveTo(cx,cy-r*1.4);ctx.lineTo(cx,cy+r*1.4);ctx.stroke();
    ctx.setLineDash([1.5,8]);ctx.beginPath();ctx.arc(cx,cy,r*.93,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    // Faint technical calibration ticks
    ctx.strokeStyle="rgba(217,188,129,.22)";for(let i=0;i<72;i++){const a=i*Math.PI/36,ri=r*.96,ro=ri+(i%6===0?8:3);ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri);ctx.lineTo(cx+Math.cos(a)*ro,cy+Math.sin(a)*ro);ctx.stroke();}
    ctx.restore();
  }
  function drawOrbit(d,index,time){
    ctx.save();ctx.beginPath();const n=300;
    for(let i=0;i<=n;i++){const p=orbitPoint({...d,yaw:d.yaw+state.spin*(index%2?-.23:.29)},i/n*Math.PI*2);if(i===0)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);}
    ctx.closePath();ctx.globalAlpha=d.alpha*.18;ctx.strokeStyle=d.color;ctx.lineWidth=d.width+5;ctx.shadowColor=d.color;ctx.shadowBlur=d.glow*3;ctx.stroke();
    ctx.globalAlpha=d.alpha;ctx.lineWidth=d.width;ctx.shadowBlur=d.glow;ctx.strokeStyle=d.color;ctx.stroke();ctx.restore();
  }
  function drawCore(time){
    const cx=state.width*.5,cy=state.height*.48,r=Math.min(state.width,state.height)*.153;
    const halo=ctx.createRadialGradient(cx,cy,r*.25,cx,cy,r*2.6);halo.addColorStop(0,"rgba(224,164,78,.2)");halo.addColorStop(.42,"rgba(183,137,68,.075)");halo.addColorStop(1,"rgba(183,137,68,0)");
    ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,r*2.6,0,Math.PI*2);ctx.fill();
    // Glass-and-metal shell with layered reflections and fine machining rings.
    ctx.save();ctx.translate(cx,cy);
    const pulse=1+Math.sin(time*.001)*.004;ctx.scale(pulse,pulse);
    const shadow=ctx.createRadialGradient(0,0,r*.35,0,0,r*1.5);shadow.addColorStop(0,"rgba(0,0,0,0)");shadow.addColorStop(.75,"rgba(0,0,0,.14)");shadow.addColorStop(1,"rgba(0,0,0,0)");
    ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,r*1.5,0,Math.PI*2);ctx.fill();
    const metal=ctx.createRadialGradient(-r*.48,-r*.58,r*.03,r*.12,r*.22,r*1.28);
    metal.addColorStop(0,"#f4e5bc");metal.addColorStop(.12,"#a6aaa0");metal.addColorStop(.22,"#353e37");metal.addColorStop(.36,"#17241e");metal.addColorStop(.49,"#65746a");metal.addColorStop(.55,"#1c2922");metal.addColorStop(.68,"#090f0c");metal.addColorStop(.82,"#35443a");metal.addColorStop(.94,"#101915");metal.addColorStop(1,"#050907");
    ctx.shadowColor="rgba(227,169,86,.28)";ctx.shadowBlur=24;ctx.fillStyle=metal;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    // Specular arcs: cool reflection and warm machined rim.
    ctx.strokeStyle="rgba(237,219,176,.8)";ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,r*.98,-2.6,-.6);ctx.stroke();
    ctx.strokeStyle="rgba(115,197,195,.68)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.96,2.7,4.25);ctx.stroke();
    for(let i=0;i<5;i++){ctx.beginPath();ctx.ellipse(0,0,r*(.31+i*.115),r*(.27+i*.105),-.25,0,Math.PI*2);ctx.strokeStyle=i%2?"rgba(221,177,101,.27)":"rgba(201,220,205,.18)";ctx.lineWidth=i===0?1.1:.65;ctx.stroke();}
    // Dense engraved radial ticks and tiny fasteners.
    for(let i=0;i<96;i++){const a=i*Math.PI*2/96,ri=r*.79,ro=ri+(i%8===0?7:i%4===0?4:2);ctx.strokeStyle=i%8===0?"rgba(240,205,137,.68)":"rgba(209,219,207,.28)";ctx.lineWidth=i%8===0?1:.55;ctx.beginPath();ctx.moveTo(Math.cos(a)*ri,Math.sin(a)*ri);ctx.lineTo(Math.cos(a)*ro,Math.sin(a)*ro);ctx.stroke();}
    // Central luminous lens, not a flat filled circle.
    const lens=ctx.createRadialGradient(-r*.08,-r*.1,r*.01,0,0,r*.36);lens.addColorStop(0,"#fff0c8");lens.addColorStop(.12,"#f7d58d");lens.addColorStop(.34,"#ba8641");lens.addColorStop(.58,"#2e3328");lens.addColorStop(.78,"#101812");lens.addColorStop(1,"rgba(4,9,6,.25)");
    ctx.fillStyle=lens;ctx.beginPath();ctx.arc(0,0,r*.36,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(250,216,147,.82)";ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(0,0,r*.365,0,Math.PI*2);ctx.stroke();
    const beam=ctx.createLinearGradient(-r*.42,-r*.05,r*.42,r*.12);beam.addColorStop(0,"rgba(109,198,195,0)");beam.addColorStop(.45,"rgba(123,205,199,.9)");beam.addColorStop(.55,"rgba(255,226,166,.95)");beam.addColorStop(1,"rgba(232,174,82,0)");
    ctx.strokeStyle=beam;ctx.lineWidth=1.5;ctx.beginPath();ctx.ellipse(0,0,r*.51,r*.12,-.38,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }
  function drawParticle(p,time){
    const d=orbits[p.orbit],pt=orbitPoint({...d,yaw:d.yaw+state.spin*(p.orbit%2?-.23:.29)},p.t+state.spin*(p.orbit%2?-.45:.6));
    const depth=Math.max(.45,Math.min(1.35,.8+pt.z*.3)),r=p.r*depth;
    ctx.save();ctx.globalAlpha=p.alpha;ctx.shadowColor=pt.z>.1?"#7bcac7":"#e5b66b";ctx.shadowBlur=p.r>1.5?12:4;
    const g=ctx.createRadialGradient(pt.x-r*.3,pt.y-r*.35,.1,pt.x,pt.y,r*2.5);g.addColorStop(0,"#fff4d6");g.addColorStop(.22,pt.z>.1?"#a9ded8":"#e8c17c");g.addColorStop(.5,pt.z>.1?"#477d78":"#8b6434");g.addColorStop(1,"rgba(10,18,13,0)");
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(pt.x,pt.y,r*2.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }
  function drawCallout(time){
    // Tiny signal markers and restrained technical leaders around the apparatus.
    const w=state.width,h=state.height;ctx.save();ctx.lineWidth=.65;ctx.font="8px 'DM Mono',monospace";ctx.fillStyle="rgba(204,218,203,.55)";ctx.strokeStyle="rgba(204,218,203,.24)";
    const cx=w*.5,cy=h*.48,r=Math.min(w,h)*.39;
    [[cx-r*.75,cy-r*.5,cx-r*1.02,cy-r*.72],[cx+r*.66,cy-r*.6,cx+r*.92,cy-r*.82],[cx+r*.72,cy+r*.56,cx+r*.97,cy+r*.67]].forEach((p,i)=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.lineTo(p[2]+(i===1?22:-18),p[3]);ctx.stroke();ctx.beginPath();ctx.arc(p[0],p[1],1.8,0,Math.PI*2);ctx.fill();});
    // Fine dotted telemetry orbit around the shell
    for(let i=0;i<42;i++){const a=i*Math.PI*2/42+state.spin*.08,rr=r*(.83+.02*Math.sin(i*1.7));ctx.globalAlpha=.14+(i%4)*.07;ctx.fillStyle=i%5===0?"#d9ad65":"#afc6b8";ctx.beginPath();ctx.arc(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr, i%7===0?1.25:.55,0,Math.PI*2);ctx.fill();}
    ctx.restore();
  }
  function render(time){
    if(!state.paused&&!state.dragging)state.spin+=Math.min(32,time-(state.last||time))*.00013;
    state.last=time;ctx.clearRect(0,0,state.width,state.height);drawBackground(time);drawGrid();
    // Render all orbit paths first, then the metallic core, then luminous hardware-like nodes.
    orbits.forEach((d,i)=>drawOrbit(d,i,time));drawCore(time);
    particles.forEach(p=>drawParticle(p,time));drawCallout(time);
    requestAnimationFrame(render);
  }
  function sync(){pauseButton.textContent=state.paused?"Resume motion":"Pause motion";pauseButton.setAttribute("aria-pressed",String(state.paused));}
  pauseButton.addEventListener("click",()=>{state.paused=!state.paused;sync();});
  resetButton.addEventListener("click",()=>{state.yaw=-.32;state.pitch=-.2;state.spin=0;});
  canvas.addEventListener("pointerdown",e=>{state.dragging=true;state.px=e.clientX;state.py=e.clientY;canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener("pointermove",e=>{if(!state.dragging)return;const dx=e.clientX-state.px,dy=e.clientY-state.py;state.yaw+=dx*.006;state.pitch=Math.max(-1.05,Math.min(1.05,state.pitch+dy*.006));state.px=e.clientX;state.py=e.clientY;});
  const stop=()=>{state.dragging=false;};canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);
  reduceMotion.addEventListener?.("change",e=>{if(e.matches){state.paused=true;sync();}});
  sync();requestAnimationFrame(render);
})();
