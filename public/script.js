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




/* MQSI interactive quantum-inspired visualisation; illustrative only, not a quantum simulator. */
(() => {
  const canvas=document.querySelector(".quantum-canvas"); if(!canvas)return;
  const ctx=canvas.getContext("2d",{alpha:true});if(!ctx)return;
  const stage=canvas.closest(".quantum-stage"),pauseButton=stage.querySelector(".motion-toggle"),resetButton=stage.querySelector(".motion-reset");
  const reduced=matchMedia("(prefers-reduced-motion: reduce)");
  const S={yaw:-.32,pitch:-.2,spin:0,paused:reduced.matches,drag:false,px:0,py:0,w:1,h:1,dpr:1,last:0};
  let dust=[];
  const ORBITS=[
    {a:1.01,b:.315,yaw:.16,pitch:.14,roll:-.52,color:[211,173,111],alpha:.8,width:1.25,glow:5},
    {a:.91,b:.34,yaw:1,pitch:-.25,roll:.52,color:[190,210,199],alpha:.68,width:1.05,glow:4},
    {a:.84,b:.4,yaw:-.16,pitch:.13,roll:1.52,color:[222,164,84],alpha:.88,width:1.35,glow:7},
    {a:.72,b:.25,yaw:.75,pitch:.7,roll:-.92,color:[106,171,168],alpha:.52,width:.85,glow:3},
    {a:1.06,b:.2,yaw:.55,pitch:-.54,roll:.1,color:[224,208,165],alpha:.32,width:.7,glow:2}
  ];
  const NODES=Array.from({length:76},(_,i)=>({o:i%ORBITS.length,t:i*2.399963,r:i%11===0?1.8:.5+(i%4)*.22,a:.15+(i%6)*.09}));
  const rgba=(c,a)=>`rgba(${c[0]},${c[1]},${c[2]},${a})`;
  function resize(){const r=stage.getBoundingClientRect();S.w=Math.max(1,r.width);S.h=Math.max(1,r.height);S.dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(S.w*S.dpr);canvas.height=Math.round(S.h*S.dpr);ctx.setTransform(S.dpr,0,0,S.dpr,0,0);dust=Array.from({length:Math.floor(S.w*S.h/1250)},()=>({x:Math.random()*S.w,y:Math.random()*S.h,r:.2+Math.random()*.65,a:.025+Math.random()*.13,p:Math.random()*6.28}));}
  if("ResizeObserver"in window)new ResizeObserver(resize).observe(stage);else addEventListener("resize",resize);resize();
  function project(p,yaw,pitch,roll){let x=p.x*Math.cos(roll)-p.y*Math.sin(roll),y=p.x*Math.sin(roll)+p.y*Math.cos(roll),z=p.z||0;const x1=x*Math.cos(yaw)+z*Math.sin(yaw),z1=-x*Math.sin(yaw)+z*Math.cos(yaw),y1=y*Math.cos(pitch)-z1*Math.sin(pitch),z2=y*Math.sin(pitch)+z1*Math.cos(pitch),x2=x1*Math.cos(S.yaw)+z2*Math.sin(S.yaw),z3=-x1*Math.sin(S.yaw)+z2*Math.cos(S.yaw),y2=y1*Math.cos(S.pitch)-z3*Math.sin(S.pitch),z4=y1*Math.sin(S.pitch)+z3*Math.cos(S.pitch),persp=2.7/(2.7-z4*.33),scale=Math.min(S.w,S.h)*.365;return{x:S.w*.5+x2*scale*persp,y:S.h*.48+y2*scale*persp,z:z4,persp};}
  function pt(d,t,index){return project({x:Math.cos(t)*d.a,y:Math.sin(t)*d.b,z:0},d.yaw+S.spin*(index%2?-.2:.26),d.pitch,d.roll);}
  function atmosphere(time){const w=S.w,h=S.h,cx=w/2,cy=h*.48,r=Math.min(w,h);let g=ctx.createRadialGradient(cx*.98,cy*.9,0,cx,cy,r*.67);g.addColorStop(0,"rgba(180,144,91,.105)");g.addColorStop(.32,"rgba(91,129,112,.08)");g.addColorStop(.7,"rgba(20,39,30,.025)");g.addColorStop(1,"rgba(4,10,7,0)");ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    dust.forEach(d=>{ctx.globalAlpha=d.a*(.8+.2*Math.sin(time*.0003+d.p));ctx.fillStyle=d.p>3?"#b7d2c9":"#dfc28c";ctx.fillRect(d.x,d.y,d.r,d.r);});ctx.globalAlpha=1;
    const v=ctx.createRadialGradient(cx,cy,r*.2,cx,cy,r*.75);v.addColorStop(0,"rgba(0,0,0,0)");v.addColorStop(1,"rgba(1,7,4,.28)");ctx.fillStyle=v;ctx.fillRect(0,0,w,h);}
  function calibration(){const cx=S.w/2,cy=S.h*.48,r=Math.min(S.w,S.h)*.405;ctx.save();ctx.strokeStyle="rgba(201,218,205,.11)";ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(cx-r*1.42,cy);ctx.lineTo(cx+r*1.42,cy);ctx.moveTo(cx,cy-r*1.38);ctx.lineTo(cx,cy+r*1.38);ctx.stroke();ctx.setLineDash([1,8]);ctx.beginPath();ctx.arc(cx,cy,r*.94,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);for(let i=0;i<144;i++){let a=i*Math.PI/72,ri=r*.97,ro=ri+(i%12===0?7:i%3===0?3:1.3);ctx.strokeStyle=i%12===0?"rgba(220,180,109,.34)":"rgba(198,216,202,.14)";ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri);ctx.lineTo(cx+Math.cos(a)*ro,cy+Math.sin(a)*ro);ctx.stroke();}ctx.restore();}
  function orbit(d,index){const pts=[];for(let i=0;i<=360;i++)pts.push(pt(d,i/360*Math.PI*2,index));ctx.save();for(let i=0;i<360;i++){const a=pts[i],b=pts[i+1],front=(a.z+b.z)*.5>.03;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineWidth=front?d.width:d.width*.72;ctx.strokeStyle=rgba(d.color,front?d.alpha:d.alpha*.36);ctx.shadowColor=rgba(d.color,front?.75:.28);ctx.shadowBlur=front?d.glow:1.2;ctx.stroke();if(front&&i%18===0){ctx.beginPath();ctx.arc((a.x+b.x)/2,(a.y+b.y)/2,.7,0,Math.PI*2);ctx.fillStyle=rgba(d.color,.75);ctx.fill();}}ctx.restore();}
  function core(time){const cx=S.w/2,cy=S.h*.48,r=Math.min(S.w,S.h)*.151;ctx.save();
    let bloom=ctx.createRadialGradient(cx,cy,r*.2,cx,cy,r*2.8);bloom.addColorStop(0,"rgba(225,171,91,.19)");bloom.addColorStop(.32,"rgba(112,166,152,.075)");bloom.addColorStop(1,"rgba(112,166,152,0)");ctx.fillStyle=bloom;ctx.beginPath();ctx.arc(cx,cy,r*2.8,0,Math.PI*2);ctx.fill();
    // Layered machined casing, bevel, dark ceramic, brushed metal and lens reflections.
    const shell=ctx.createRadialGradient(cx-r*.42,cy-r*.5,r*.015,cx+r*.1,cy+r*.1,r*1.25);shell.addColorStop(0,"#c3c7b8");shell.addColorStop(.045,"#626d62");shell.addColorStop(.095,"#18241e");shell.addColorStop(.18,"#879185");shell.addColorStop(.225,"#29352e");shell.addColorStop(.31,"#0a100d");shell.addColorStop(.47,"#35443a");shell.addColorStop(.56,"#101914");shell.addColorStop(.7,"#050907");shell.addColorStop(.82,"#24322a");shell.addColorStop(.91,"#080e0b");shell.addColorStop(1,"#020504");
    ctx.shadowColor="rgba(0,0,0,.65)";ctx.shadowBlur=26;ctx.fillStyle=shell;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
    // Concentric optical glass and metal rings with anisotropic specular sweeps.
    for(let i=0;i<8;i++){const rr=r*(.94-i*.092);ctx.beginPath();ctx.arc(cx,cy,rr,0,Math.PI*2);ctx.strokeStyle=i%2?"rgba(192,207,192,.12)":"rgba(233,197,132,.2)";ctx.lineWidth=i%3===0?1.5:.65;ctx.stroke();}
    const spec=ctx.createLinearGradient(cx-r*.8,cy-r*.7,cx+r*.75,cy+r*.75);spec.addColorStop(0,"rgba(255,242,208,.78)");spec.addColorStop(.12,"rgba(255,255,255,.05)");spec.addColorStop(.43,"rgba(116,206,201,.03)");spec.addColorStop(.57,"rgba(219,177,107,.22)");spec.addColorStop(1,"rgba(0,0,0,.1)");ctx.strokeStyle=spec;ctx.lineWidth=r*.075;ctx.beginPath();ctx.arc(cx,cy,r*.78,-2.72,-.75);ctx.stroke();
    // Fine engraved ticks and small recessed fasteners around the inner bezel.
    for(let i=0;i<120;i++){const a=i*Math.PI*2/120,ri=r*(.69+(i%5===0?.02:0)),ro=ri+(i%10===0?7:i%5===0?4:1.8);ctx.strokeStyle=i%10===0?"rgba(226,190,123,.78)":"rgba(200,216,202,.34)";ctx.lineWidth=i%10===0?1:.55;ctx.beginPath();ctx.moveTo(cx+Math.cos(a)*ri,cy+Math.sin(a)*ri);ctx.lineTo(cx+Math.cos(a)*ro,cy+Math.sin(a)*ro);ctx.stroke();if(i%20===0){ctx.fillStyle="rgba(4,8,6,.9)";ctx.beginPath();ctx.arc(cx+Math.cos(a)*r*.62,cy+Math.sin(a)*r*.62,1.6,0,Math.PI*2);ctx.fill();}}
    const lensR=r*.34;let lens=ctx.createRadialGradient(cx-lensR*.42,cy-lensR*.5,1,cx+lensR*.12,cy+lensR*.12,lensR*1.35);lens.addColorStop(0,"#e3e0c9");lens.addColorStop(.08,"#9ca79a");lens.addColorStop(.17,"#394b40");lens.addColorStop(.32,"#111b15");lens.addColorStop(.48,"#c1a16a");lens.addColorStop(.53,"#e8c787");lens.addColorStop(.6,"#3b3e2e");lens.addColorStop(.78,"#0a110d");lens.addColorStop(1,"#020604");ctx.fillStyle=lens;ctx.beginPath();ctx.arc(cx,cy,lensR,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(239,215,164,.76)";ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(cx,cy,lensR*1.06,0,Math.PI*2);ctx.stroke();
    const reflection=ctx.createLinearGradient(cx-lensR,cy-lensR*.3,cx+lensR,cy+lensR*.5);reflection.addColorStop(0,"rgba(120,213,208,0)");reflection.addColorStop(.4,"rgba(133,213,202,.62)");reflection.addColorStop(.54,"rgba(255,233,184,.9)");reflection.addColorStop(1,"rgba(220,172,91,0)");ctx.strokeStyle=reflection;ctx.lineWidth=1.4;ctx.beginPath();ctx.ellipse(cx,cy,lensR*.94,lensR*.24,-.42,0,Math.PI*2);ctx.stroke();
    // Lens glint and glass bloom, kept subtle to avoid neon/cartoon effects.
    const glint=ctx.createRadialGradient(cx-lensR*.3,cy-lensR*.35,0,cx-lensR*.3,cy-lensR*.35,lensR*.4);glint.addColorStop(0,"rgba(255,249,225,.72)");glint.addColorStop(1,"rgba(255,249,225,0)");ctx.fillStyle=glint;ctx.beginPath();ctx.arc(cx-lensR*.3,cy-lensR*.35,lensR*.4,0,Math.PI*2);ctx.fill();
    ctx.restore();}
  function nodes(time){for(const n of NODES){const d=ORBITS[n.o],p=pt(d,n.t+S.spin*(n.o%2?-.5:.7),n.o),depth=Math.max(.35,Math.min(1.4,.8+p.z*.28)),rr=n.r*depth;ctx.save();ctx.globalAlpha=n.a*(p.z<-.1?.48:1);const g=ctx.createRadialGradient(p.x-rr*.4,p.y-rr*.4,.1,p.x,p.y,rr*3.5);g.addColorStop(0,"#fff5d9");g.addColorStop(.2,n.o%2?"#a8cfc7":"#e5c07c");g.addColorStop(.55,rgba(d.color,.5));g.addColorStop(1,rgba(d.color,0));ctx.fillStyle=g;ctx.beginPath();ctx.arc(p.x,p.y,rr*3.5,0,Math.PI*2);ctx.fill();ctx.restore();}}
  function annotations(){const cx=S.w/2,cy=S.h*.48,r=Math.min(S.w,S.h)*.39;ctx.save();ctx.lineWidth=.6;ctx.strokeStyle="rgba(199,216,203,.27)";[[cx-r*.75,cy-r*.5,cx-r*1.05,cy-r*.72],[cx+r*.68,cy-r*.58,cx+r*.94,cy-r*.81],[cx+r*.72,cy+r*.56,cx+r*1.01,cy+r*.69]].forEach(p=>{ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(p[2],p[3]);ctx.lineTo(p[2]+(p[0]<cx?-18:18),p[3]);ctx.stroke();ctx.fillStyle="rgba(219,197,150,.8)";ctx.beginPath();ctx.arc(p[0],p[1],1.5,0,Math.PI*2);ctx.fill();});ctx.restore();}
  function render(t){if(!S.paused&&!S.drag)S.spin+=Math.min(32,t-(S.last||t))*.000105;S.last=t;ctx.clearRect(0,0,S.w,S.h);atmosphere(t);calibration();ORBITS.forEach(orbit);core(t);nodes(t);annotations();requestAnimationFrame(render);}
  function sync(){pauseButton.textContent=S.paused?"Resume motion":"Pause motion";pauseButton.setAttribute("aria-pressed",String(S.paused));}
  pauseButton.addEventListener("click",()=>{S.paused=!S.paused;sync();});resetButton.addEventListener("click",()=>{S.yaw=-.32;S.pitch=-.2;S.spin=0;});
  canvas.addEventListener("pointerdown",e=>{S.drag=true;S.px=e.clientX;S.py=e.clientY;canvas.setPointerCapture(e.pointerId);});canvas.addEventListener("pointermove",e=>{if(!S.drag)return;S.yaw+=(e.clientX-S.px)*.006;S.pitch=Math.max(-1.05,Math.min(1.05,S.pitch+(e.clientY-S.py)*.006));S.px=e.clientX;S.py=e.clientY;});const stop=()=>S.drag=false;canvas.addEventListener("pointerup",stop);canvas.addEventListener("pointercancel",stop);reduced.addEventListener?.("change",e=>{if(e.matches){S.paused=true;sync();}});sync();requestAnimationFrame(render);
})();
