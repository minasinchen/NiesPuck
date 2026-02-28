/*
  Season Automation
  - Automatically adapts:
    - Hero image (CSS variable --hero-image)
    - Accent/tint colors
    - Seasonal banner copy
    - Featured categories (where present)
  - Override:
    - URL: ?season=spring|summer|autumn|winter
    - localStorage: niespuck_season_override
*/

const SEASON_CONFIG = {
  spring: {
    label: "Frühling",
    accent: "#7EA38D",   // fresh sage
    tint:   "#F4EFEA",   // warm pastel
    accent2:"#E8D3CC",   // soft blush
    hero:   "url('assets/img/hero-spring.jpg')",
    bannerTitle: "Jetzt: Frühjahrsgrößen",
    bannerText:  "Leichtes Layering, frische Farben & Lieblingsstücke für draußen.",
    featured: ["Übergangsjacken", "Sneaker", "Sets & Layering"]
  },
  summer: {
    label: "Sommer",
    accent: "#B88A2D",   // honey
    tint:   "#FFF2D7",
    accent2:"#E7D2B6",
    hero:   "url('assets/img/hero-summer.jpg')",
    bannerTitle: "Jetzt: Sommer-Essentials",
    bannerText:  "Leicht, unkompliziert, sonnig – perfekt für warme Tage.",
    featured: ["Kleider & Shorts", "Badezeit", "Sandalen"]
  },
  autumn: {
    label: "Herbst",
    accent: "#A45B3D",   // terracotta
    tint:   "#F2E7DE",
    accent2:"#D2B59A",
    hero:   "url('assets/img/hero-autumn.jpg')",
    bannerTitle: "Jetzt: Herbst-Layering",
    bannerText:  "Wärmende Schichten in erdigen Tönen – bereit für windige Tage.",
    featured: ["Strick & Wolle", "Regenfeste", "Boots"]
  },
  winter: {
    label: "Winter",
    accent: "#2E5B4F",   // calm pine
    tint:   "#EEF1F0",
    accent2:"#C9D3CF",
    hero:   "url('assets/img/hero-winter.jpg')",
    bannerTitle: "Jetzt: Cozy Winterstücke",
    bannerText:  "Ruhig, warm & kuschelig – zeitlose Essentials für kalte Tage.",
    featured: ["Jacken & Overalls", "Strick", "Accessoires"]
  }
};

function meteorologicalSeason(date = new Date()) {
  const m = date.getMonth() + 1; // 1..12
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

function getSeason() {
  const params = new URLSearchParams(window.location.search);
  const qp = params.get("season");
  if (qp && SEASON_CONFIG[qp]) {
    localStorage.setItem("niespuck_season_override", qp);
    return qp;
  }
  const stored = localStorage.getItem("niespuck_season_override");
  if (stored && SEASON_CONFIG[stored]) return stored;
  return meteorologicalSeason();
}

function applySeason(seasonKey) {
  const s = SEASON_CONFIG[seasonKey] || SEASON_CONFIG.winter;

  const r = document.documentElement;
  r.style.setProperty("--accent", s.accent);
  r.style.setProperty("--tint", s.tint);
  r.style.setProperty("--accent-2", s.accent2);
  r.style.setProperty("--hero-image", s.hero);

  // Update any elements with data-season="..."
  document.querySelectorAll("[data-season='label']").forEach(el => el.textContent = s.label);
  document.querySelectorAll("[data-season='bannerTitle']").forEach(el => el.textContent = s.bannerTitle);
  document.querySelectorAll("[data-season='bannerText']").forEach(el => el.textContent = s.bannerText);

  // Featured chips
  const chipsWrap = document.querySelector("[data-season='featured']");
  if (chipsWrap) {
    chipsWrap.innerHTML = "";
    s.featured.forEach(x => {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = x;
      chipsWrap.appendChild(span);
    });
  }

  // For accessibility/meta
  document.querySelectorAll("[data-season='meta']").forEach(el => {
    el.textContent = `Saison-Look: ${s.label}`;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applySeason(getSeason());
});
