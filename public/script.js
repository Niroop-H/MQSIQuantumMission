const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".desktop-nav");
if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  }));
}
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener("click", event => {
  const target = document.querySelector(link.getAttribute("href"));
  if (target) {
    event.preventDefault();
    target.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", link.getAttribute("href"));
  }
}));
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();
