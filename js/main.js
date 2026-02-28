/* Small UI helpers: active nav, lightbox gallery */
function markActiveNav(){
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("[data-nav]").forEach(a=>{
    const href = a.getAttribute("href");
    if (href === path) a.classList.add("active");
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

document.addEventListener("DOMContentLoaded", ()=>{
  markActiveNav();
  initGalleryLightbox();
});
