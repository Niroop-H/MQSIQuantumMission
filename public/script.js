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


// Interactive, dependency-free 3D orbital model for the MQSI mission hero.
(() => {
  const canvas = document.querySelector(".quantum-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const stage = canvas.closest(".quantum-stage");
  const pauseButton = stage.querySelector(".motion-toggle");
  const resetButton = stage.querySelector(".motion-reset");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = { yaw: -0.35, pitch: -0.2, spin: 0, paused: reduceMotion.matches, dragging: false, moved: false, px: 0, py: 0, width: 0, height: 0, dpr: 1, last: 0 };
  const orbitDefs = [
    { a: .91, b: .36, yaw: .18, pitch: .12, roll: -.52, color: "#f4d99d", alpha: .85, width: 1.5 },
    { a: .89, b: .35, yaw: 1.05, pitch: -.26, roll: .56, color: "#dce7d7", alpha: .8, width: 1.25 },
    { a: .82, b: .42, yaw: -.18, pitch: .12, roll: 1.52, color: "#e5a84e", alpha: .82, width: 1.2 },
    { a: .72, b: .26, yaw: .78, pitch: .68, roll: -.92, color: "#b9d9d0", alpha: .65, width: 1.0 }
  ];
  const particles = [
    { orbit: 0, t: .24, r: 4.8 }, { orbit: 1, t: 2.2, r: 3.4 },
    { orbit: 2, t: 4.4, r: 4.1 }, { orbit: 3, t: 5.6, r: 3.1 },
    { orbit: 0, t: 3.5, r: 2.7 }, { orbit: 1, t: 5.0, r: 2.5 }
  ];

  function resize() {
    const rect = stage.getBoundingClientRect();
    state.width = Math.max(1, rect.width);
    state.height = Math.max(1, rect.height);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(stage);
  else window.addEventListener("resize", resize);
  resize();

  function rotate(p, yaw, pitch, roll) {
    let x = p.x * Math.cos(roll) - p.y * Math.sin(roll);
    let y = p.x * Math.sin(roll) + p.y * Math.cos(roll);
    let z = p.z;
    const x1 = x * Math.cos(yaw) + z * Math.sin(yaw);
    const z1 = -x * Math.sin(yaw) + z * Math.cos(yaw);
    const y2 = y * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y * Math.sin(pitch) + z1 * Math.cos(pitch);
    const x2 = x1 * Math.cos(state.yaw) + z2 * Math.sin(state.yaw);
    const z3 = -x1 * Math.sin(state.yaw) + z2 * Math.cos(state.yaw);
    const y3 = y2 * Math.cos(state.pitch) - z3 * Math.sin(state.pitch);
    const z4 = y2 * Math.sin(state.pitch) + z3 * Math.cos(state.pitch);
    const perspective = 2.8 / (2.8 - z4 * .34);
    const scale = Math.min(state.width, state.height) * .37;
    return { x: state.width / 2 + x2 * scale * perspective, y: state.height * .48 + y3 * scale * perspective, z: z4, perspective };
  }
  function pointOnOrbit(def, t) {
    const p = { x: Math.cos(t) * def.a, y: Math.sin(t) * def.b, z: 0 };
    return rotate(p, def.yaw, def.pitch, def.roll);
  }
  function pathOrbit(def) {
    ctx.beginPath();
    const steps = 220;
    for (let i = 0; i <= steps; i++) {
      const p = pointOnOrbit(def, i / steps * Math.PI * 2);
      if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = def.color;
    ctx.globalAlpha = def.alpha;
    ctx.lineWidth = def.width;
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  function drawCore(time) {
    const cx = state.width / 2, cy = state.height * .48;
    const radius = Math.min(state.width, state.height) * .145;
    const pulse = 1 + Math.sin(time * .0012) * .018;
    const halo = ctx.createRadialGradient(cx, cy, radius * .3, cx, cy, radius * 2.5);
    halo.addColorStop(0, "rgba(226,170,77,.24)");
    halo.addColorStop(1, "rgba(226,170,77,0)");
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2); ctx.fill();

    const sphere = ctx.createRadialGradient(cx - radius * .38, cy - radius * .47, radius * .06, cx + radius * .08, cy + radius * .1, radius * 1.4);
    sphere.addColorStop(0, "#ffe9a0");
    sphere.addColorStop(.35, "#efb24f");
    sphere.addColorStop(.76, "#d8893c");
    sphere.addColorStop(1, "#9f4f2d");
    ctx.save(); ctx.translate(cx, cy); ctx.scale(pulse, pulse);
    ctx.shadowColor = "rgba(244,177,74,.34)"; ctx.shadowBlur = 24;
    ctx.fillStyle = sphere; ctx.beginPath(); ctx.arc(0, 0, radius, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = "rgba(255,239,190,.92)"; ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0, 0, radius * .68, radius * .38, -.12, .1, Math.PI * 1.82);
    ctx.strokeStyle = "rgba(255,241,197,.88)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.ellipse(-radius * .02, -radius * .03, radius * .42, radius * .27, -.55, .7, Math.PI * 1.75);
    ctx.strokeStyle = "rgba(255,241,197,.65)"; ctx.lineWidth = 1.7; ctx.stroke();
    ctx.fillStyle = "#fff3ca"; ctx.beginPath(); ctx.arc(-radius * .42, -radius * .36, radius * .07, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function drawGuides() {
    const cx = state.width / 2, cy = state.height * .48;
    const extent = Math.min(state.width, state.height) * .43;
    ctx.save(); ctx.strokeStyle = "rgba(240,235,215,.16)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(cx - extent * 1.15, cy); ctx.lineTo(cx + extent * 1.15, cy);
    ctx.moveTo(cx, cy - extent * 1.15); ctx.lineTo(cx, cy + extent * 1.15); ctx.stroke();
    ctx.setLineDash([2, 8]); ctx.beginPath(); ctx.arc(cx, cy, extent * .75, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
  }
  function render(time) {
    if (!state.paused && !state.dragging) state.spin += Math.min(32, time - (state.last || time)) * .00018;
    state.last = time;
    if (!state.dragging) state.yaw += (!state.paused ? .0004 : 0);
    ctx.clearRect(0, 0, state.width, state.height);
    drawGuides();
    // A faint ambient disc gives the orbital system depth against the forest backdrop.
    const cx = state.width / 2, cy = state.height * .48;
    const disc = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(state.width, state.height) * .39);
    disc.addColorStop(0, "rgba(9,18,14,.52)"); disc.addColorStop(1, "rgba(9,18,14,0)");
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(cx, cy, Math.min(state.width, state.height) * .39, 0, Math.PI * 2); ctx.fill();
    orbitDefs.forEach((def, i) => pathOrbit({ ...def, yaw: def.yaw + state.spin * (i % 2 ? -.45 : .35) }));
    drawCore(time);
    particles.forEach((particle) => {
      const def = orbitDefs[particle.orbit];
      const p = pointOnOrbit({ ...def, yaw: def.yaw + state.spin * (particle.orbit % 2 ? -.45 : .35) }, particle.t + state.spin * (particle.orbit % 2 ? -.7 : .9));
      ctx.save(); ctx.globalAlpha = Math.max(.45, Math.min(1, .72 + p.z * .2));
      ctx.shadowColor = "#f5cf7d"; ctx.shadowBlur = 9; ctx.fillStyle = "#f5d58c";
      ctx.beginPath(); ctx.arc(p.x, p.y, particle.r * p.perspective, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    });
    requestAnimationFrame(render);
  }
  function syncButton() {
    pauseButton.textContent = state.paused ? "Resume motion" : "Pause motion";
    pauseButton.setAttribute("aria-pressed", String(state.paused));
  }
  pauseButton.addEventListener("click", () => { state.paused = !state.paused; syncButton(); });
  resetButton.addEventListener("click", () => { state.yaw = -.35; state.pitch = -.2; state.spin = 0; });
  canvas.addEventListener("pointerdown", (event) => {
    state.dragging = true; state.moved = false; state.px = event.clientX; state.py = event.clientY;
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", (event) => {
    if (!state.dragging) return;
    const dx = event.clientX - state.px, dy = event.clientY - state.py;
    if (Math.abs(dx) + Math.abs(dy) > 1) state.moved = true;
    state.yaw += dx * .009; state.pitch = Math.max(-1.1, Math.min(1.1, state.pitch + dy * .008));
    state.px = event.clientX; state.py = event.clientY;
  });
  const stopDrag = () => { state.dragging = false; };
  canvas.addEventListener("pointerup", stopDrag);
  canvas.addEventListener("pointercancel", stopDrag);
  reduceMotion.addEventListener?.("change", (event) => { if (event.matches) { state.paused = true; syncButton(); } });
  syncButton();
  requestAnimationFrame(render);
})();
