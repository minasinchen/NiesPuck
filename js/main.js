/* Small UI helpers: active nav, lightbox gallery */
function markActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
  });
}
function initMobileNav(){
  const navbar = document.querySelector(".navbar");
  const nav = navbar ? navbar.querySelector("nav") : null;
  if (!navbar || !nav) return;

  let toggle = navbar.querySelector(".nav-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "nav-toggle";
    toggle.setAttribute("aria-label", "Men\u00fc \u00f6ffnen");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = '<span class="bars" aria-hidden="true"></span>';
    nav.before(toggle);
  }

  const closeNav = () => {
    navbar.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Men\u00fc \u00f6ffnen");
  };

  const openNav = () => {
    navbar.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Men\u00fc schlie\u00dfen");
  };

  toggle.addEventListener("click", () => {
    if (navbar.classList.contains("nav-open")) closeNav();
    else openNav();
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth >= 960) closeNav();
  });
}
function initGalleryLightbox(){
  const modal = document.querySelector("#lightbox");
  if (!modal) return;
  const modalImg = modal.querySelector("img");
  const close = modal.querySelector(".close");
  document.querySelectorAll("[data-lightbox]").forEach(link=>{
    link.addEventListener("click", (e)=>{
      e.preventDefault();
      modalImg.src = link.getAttribute("href");
      modal.classList.add("open");
    });
  });
  const closeIt = ()=> modal.classList.remove("open");
  close.addEventListener("click", closeIt);
  modal.addEventListener("click", (e)=> { if (e.target === modal) closeIt(); });
  document.addEventListener("keydown", (e)=> { if (e.key === "Escape") closeIt(); });
}

function initMorePanel(){
  const bar = document.querySelector(".mobile-bar .inner");
  if (!bar) return;

  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "mobile-mehr-btn";
  btn.setAttribute("aria-label", "Weitere Seiten");
  btn.setAttribute("aria-expanded", "false");
  btn.innerHTML = '<span class="mehr-dots" aria-hidden="true">\u00b7\u00b7\u00b7</span><span>Mehr</span>';
  bar.appendChild(btn);

  const overlay = document.createElement("div");
  overlay.className = "mehr-overlay";
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  const panel = document.createElement("div");
  panel.className = "mehr-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Weitere Seiten");
  panel.innerHTML = `
    <div class="mehr-handle" aria-hidden="true"></div>
    <div class="mehr-panel-title">Weitere Seiten</div>
    <nav class="mehr-links" aria-label="Weitere Navigation">
      <a class="mehr-link" href="ueber.html"><strong>\u00dcber uns</strong><small>Der Laden &amp; das Team</small></a>
      <a class="mehr-link" href="so-funktionierts.html"><strong>So funktioniert's</strong><small>Ablauf &amp; FAQ</small></a>
      <a class="mehr-link" href="galerie.html"><strong>Galerie</strong><small>Bilder &amp; Eindr\u00fccke</small></a>
      <a class="mehr-link" href="social.html"><strong>Social Media</strong><small>Facebook &amp; Neuigkeiten</small></a>
      <a class="mehr-link" href="memory.html"><strong>Memory-Spiel</strong><small>Schatzkisten-Memory</small></a>
    </nav>`;
  document.body.appendChild(panel);

  const open = () => {
    overlay.classList.add("open");
    panel.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    overlay.classList.remove("open");
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    panel.classList.contains("open") ? close() : open();
  });
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("open")) close();
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  markActiveNav();
  initMobileNav();
  initGalleryLightbox();
  initMorePanel();
});
