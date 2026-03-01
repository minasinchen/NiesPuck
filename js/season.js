/*
  Weather-driven season logic for Nies Puck
  - Uses Open-Meteo forecast data for the Lilienthal area
  - Falls back to calendar season if the API is unavailable
  - Supports manual override via:
    - URL: ?season=...
    - localStorage: niespuck_season_override
*/

const WEATHER_LOCATION = {
  latitude: 53.145,
  longitude: 8.85,
  timezone: "Europe/Berlin",
  forecastDays: 14
};

const WEATHER_CACHE_KEY = "niespuck_weather_season_cache";
const WEATHER_CACHE_TTL_MS = 60 * 60 * 1000;

const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);
const WINTRY_CODES = new Set([56, 57, 66, 67, 71, 73, 75, 77, 85, 86]);

function heroUrl(path) {
  const absoluteUrl = new URL(path, window.location.href).href;
  return `url("${absoluteUrl}")`;
}

const SEASON_CONFIG = {
  "late-winter": {
    label: "Sp\u00e4twinter",
    accent: "#4E6C64",
    tint: "#F1F4F3",
    accent2: "#D8E1DE",
    hero: heroUrl("assets/img/hero-winter.jpg"),
    bannerTitle: "Jetzt: Warme Schichten f\u00fcr wechselhafte Tage",
    bannerText: "K\u00fchle Morgen, milde Nachmittage und trotzdem noch alles f\u00fcr Wind, Regen oder Schnee.",
    featured: ["\u00dcbergangsjacken", "Strick", "Matsch- und regenfeste Sachen"]
  },
  winter: {
    label: "Winter",
    accent: "#2E5B4F",
    tint: "#EEF1F0",
    accent2: "#C9D3CF",
    hero: heroUrl("assets/img/hero-winter.jpg"),
    bannerTitle: "Jetzt: Cozy Winterst\u00fccke",
    bannerText: "Ruhig, warm und kuschelig - zeitlose Essentials f\u00fcr kalte Tage.",
    featured: ["Jacken und Overalls", "Strick", "Accessoires"]
  },
  "early-spring": {
    label: "Vorfr\u00fchling",
    accent: "#89A78F",
    tint: "#F6F2EC",
    accent2: "#E7D9D0",
    hero: heroUrl("assets/img/hero-spring.jpg"),
    bannerTitle: "Jetzt: Leichte Schichten f\u00fcr milde Tage",
    bannerText: "Die ersten milden Tage sind da - ideal f\u00fcr Layering, Sneaker und flexible Lieblingsst\u00fccke.",
    featured: ["\u00dcbergangsjacken", "D\u00fcnnere Pullis", "Sneaker"]
  },
  spring: {
    label: "Fr\u00fchling",
    accent: "#7EA38D",
    tint: "#F4EFEA",
    accent2: "#E8D3CC",
    hero: heroUrl("assets/img/hero-spring.jpg"),
    bannerTitle: "Jetzt: Fr\u00fchjahrsgr\u00f6\u00dfen",
    bannerText: "Leichtes Layering, frische Farben und Lieblingsst\u00fccke f\u00fcr drau\u00dfen.",
    featured: ["\u00dcbergangsjacken", "Sneaker", "Sets und Layering"]
  },
  "late-summer": {
    label: "Sp\u00e4tsommer",
    accent: "#B78B4F",
    tint: "#FFF4DD",
    accent2: "#E7D3B8",
    hero: heroUrl("assets/img/hero-summer.jpg"),
    bannerTitle: "Jetzt: Noch leicht, aber schon flexibel",
    bannerText: "Warme Tage mit k\u00fchleren Abenden - ideal f\u00fcr Mischungen aus Sommer und erster Lage.",
    featured: ["Kleider und Shorts", "Leichte Strickteile", "Sneaker"]
  },
  summer: {
    label: "Sommer",
    accent: "#B88A2D",
    tint: "#FFF2D7",
    accent2: "#E7D2B6",
    hero: heroUrl("assets/img/hero-summer.jpg"),
    bannerTitle: "Jetzt: Sommer-Essentials",
    bannerText: "Leicht, unkompliziert und sonnig - perfekt fuer warme Tage.",
    featured: ["Kleider und Shorts", "Badezeit", "Sandalen"]
  },
  "early-autumn": {
    label: "Fr\u00fchherbst",
    accent: "#B06E52",
    tint: "#F6EDE5",
    accent2: "#DFC4AF",
    hero: heroUrl("assets/img/hero-autumn.jpg"),
    bannerTitle: "Jetzt: Erste Lagen f\u00fcr k\u00fchlere Tage",
    bannerText: "Noch nicht richtig kalt, aber schon ideal f\u00fcr Strick, Westen und wetterfeste Begleiter.",
    featured: ["Leichte Jacken", "Strick", "Boots"]
  },
  autumn: {
    label: "Herbst",
    accent: "#A45B3D",
    tint: "#F2E7DE",
    accent2: "#D2B59A",
    hero: heroUrl("assets/img/hero-autumn.jpg"),
    bannerTitle: "Jetzt: Herbst-Layering",
    bannerText: "W\u00e4rmende Schichten in erdigen T\u00f6nen - bereit f\u00fcr windige Tage.",
    featured: ["Strick und Wolle", "Regenfeste", "Boots"]
  }
};

function meteorologicalSeason(date = new Date()) {
  const month = date.getMonth() + 1;
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter";
}

function average(values) {
  if (!Array.isArray(values) || values.length === 0) return null;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

function countWhere(values, predicate) {
  if (!Array.isArray(values)) return 0;
  return values.reduce((count, value, index) => {
    return predicate(value, index) ? count + 1 : count;
  }, 0);
}

function getManualOverride() {
  try {
    const params = new URLSearchParams(window.location.search);
    const querySeason = params.get("season");
    if (querySeason && SEASON_CONFIG[querySeason]) {
      localStorage.setItem("niespuck_season_override", querySeason);
      return querySeason;
    }

    const storedSeason = localStorage.getItem("niespuck_season_override");
    if (storedSeason && SEASON_CONFIG[storedSeason]) return storedSeason;
  } catch (error) {
    console.warn("Season override unavailable:", error);
  }

  return null;
}

function readWeatherCache() {
  try {
    const raw = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.seasonKey || !parsed.savedAt) return null;
    if (!SEASON_CONFIG[parsed.seasonKey]) return null;
    if (Date.now() - parsed.savedAt > WEATHER_CACHE_TTL_MS) return null;

    return parsed.seasonKey;
  } catch (error) {
    console.warn("Weather cache unavailable:", error);
    return null;
  }
}

function writeWeatherCache(seasonKey) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify({
      seasonKey,
      savedAt: Date.now()
    }));
  } catch (error) {
    console.warn("Weather cache write failed:", error);
  }
}

function getInitialSeason() {
  const manualOverride = getManualOverride();
  if (manualOverride) return manualOverride;

  const cachedSeason = readWeatherCache();
  if (cachedSeason) return cachedSeason;

  return meteorologicalSeason();
}

function getDayLabel(dateString, index) {
  if (index === 0) return "Heute";

  try {
    const date = new Date(`${dateString}T12:00:00`);
    return new Intl.DateTimeFormat("de-DE", { weekday: "short" }).format(date);
  } catch (error) {
    return `Tag ${index + 1}`;
  }
}

function weatherIconForCode(code) {
  if (SNOW_CODES.has(code)) return "\u2744";
  if (WINTRY_CODES.has(code)) return "\u2746";
  if (code === 0) return "\u2600";
  if ([1, 2].includes(code)) return "\u26c5";
  if (code === 3 || [45, 48].includes(code)) return "\u2601";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "\u2614";
  if ([95, 96, 99].includes(code)) return "\u26a1";
  return "\u2601";
}

function weatherLabelForCode(code) {
  if (SNOW_CODES.has(code)) return "Schnee";
  if ([56, 57, 66, 67].includes(code)) return "Glatteis/Regen";
  if (code === 0) return "Klar";
  if ([1, 2].includes(code)) return "Leicht bewolkt";
  if (code === 3) return "Bedeckt";
  if ([45, 48].includes(code)) return "Nebel";
  if ([51, 53, 55].includes(code)) return "Niesel";
  if ([61, 63, 65, 80, 81, 82].includes(code)) return "Regen";
  if ([95, 96, 99].includes(code)) return "Gewitter";
  return "Wechselhaft";
}

function renderWeatherMini(daily) {
  document.querySelectorAll("[data-weather='mini']").forEach(wrap => {
    const dates = (daily.time || []).slice(0, 3);
    const maxTemps = (daily.temperature_2m_max || []).slice(0, 3);
    const minTemps = (daily.temperature_2m_min || []).slice(0, 3);
    const weatherCodes = (daily.weather_code || []).slice(0, 3);

    if (!dates.length) { wrap.innerHTML = ""; return; }

    wrap.innerHTML = "";
    dates.forEach((dateString, i) => {
      const code = weatherCodes[i] ?? -1;
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.innerHTML = `<span aria-hidden="true">${weatherIconForCode(code)}</span><strong style="color:var(--text);margin-right:2px">${getDayLabel(dateString, i)}</strong> ${Math.round(maxTemps[i])}\u00b0&thinsp;/&thinsp;${Math.round(minTemps[i])}\u00b0`;
      wrap.appendChild(chip);
    });
  });
}

function renderWeatherOutlook(daily) {
  const forecastWrap = document.querySelector("[data-weather='forecast']");
  if (!forecastWrap) return;

  const dates = (daily.time || []).slice(0, 7);
  const maxTemps = (daily.temperature_2m_max || []).slice(0, 7);
  const minTemps = (daily.temperature_2m_min || []).slice(0, 7);
  const weatherCodes = (daily.weather_code || []).slice(0, 7);
  const precipitation = (daily.precipitation_sum || []).slice(0, 7);
  const snowfall = (daily.snowfall_sum || []).slice(0, 7);

  if (!dates.length) {
    forecastWrap.innerHTML = '<div class="weather-empty">Aktuell konnten keine Wetterdaten angezeigt werden.</div>';
    return;
  }

  forecastWrap.innerHTML = "";

  dates.forEach((dateString, index) => {
    const weatherCode = weatherCodes[index] ?? -1;
    const day = document.createElement("div");
    day.className = "weather-day";

    const precipitationText = snowfall[index] > 0
      ? `${Math.round(snowfall[index] * 10) / 10} cm Schnee`
      : `${Math.round((precipitation[index] || 0) * 10) / 10} mm Regen`;

    day.innerHTML = `
      <div class="top">
        <strong>${getDayLabel(dateString, index)}</strong>
        <span class="icon" aria-hidden="true">${weatherIconForCode(weatherCode)}</span>
      </div>
      <div class="temps">
        <span>Max ${Math.round(maxTemps[index])}\u00b0</span>
        <span>Min ${Math.round(minTemps[index])}\u00b0</span>
      </div>
      <div class="meta">${weatherLabelForCode(weatherCode)}</div>
      <div class="meta">${precipitationText}</div>
    `;

    forecastWrap.appendChild(day);
  });
}

async function fetchForecast() {
  const params = new URLSearchParams({
    latitude: String(WEATHER_LOCATION.latitude),
    longitude: String(WEATHER_LOCATION.longitude),
    timezone: WEATHER_LOCATION.timezone,
    forecast_days: String(WEATHER_LOCATION.forecastDays),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "apparent_temperature_max",
      "snowfall_sum",
      "precipitation_sum"
    ].join(",")
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Weather API request failed: ${response.status}`);
  }

  const data = await response.json();
  if (!data || !data.daily) {
    throw new Error("Weather API returned no daily forecast");
  }

  return data.daily;
}

function detectWeatherDrivenSeason(daily) {
  const maxTemps = daily.temperature_2m_max || [];
  const minTemps = daily.temperature_2m_min || [];
  const apparentMaxTemps = daily.apparent_temperature_max || maxTemps;
  const weatherCodes = daily.weather_code || [];
  const snowfall = daily.snowfall_sum || [];

  const next7Max = maxTemps.slice(0, 7);
  const next7Min = minTemps.slice(0, 7);
  const next7Apparent = apparentMaxTemps.slice(0, 7);
  const next7Codes = weatherCodes.slice(0, 7);
  const next7Snow = snowfall.slice(0, 7);

  const avgMax = average(next7Max);
  const avgMin = average(next7Min);
  const avgApparent = average(next7Apparent);
  const freezingNights = countWhere(next7Min, (temp) => temp <= 0);
  const veryColdDays = countWhere(next7Max, (temp) => temp <= 4);
  const warmDays = countWhere(next7Max, (temp) => temp >= 14);
  const hotDays = countWhere(next7Max, (temp) => temp >= 24);
  const coolDays = countWhere(next7Max, (temp) => temp <= 17);
  const wintryDays = countWhere(next7Codes, (code) => WINTRY_CODES.has(code));
  const snowDays = countWhere(next7Codes, (code, index) => {
    return SNOW_CODES.has(code) || (next7Snow[index] || 0) >= 0.5;
  });

  const calendarSeason = meteorologicalSeason();

  if (snowDays >= 1 || wintryDays >= 2 || freezingNights >= 3 || veryColdDays >= 2) {
    if ((avgMax !== null && avgMax >= 7) || warmDays >= 2) return "late-winter";
    return "winter";
  }

  if (calendarSeason === "winter") {
    if ((avgMax !== null && avgMax >= 12) || warmDays >= 3 || (avgApparent !== null && avgApparent >= 13)) {
      return "early-spring";
    }
    if ((avgMax !== null && avgMax >= 7) || warmDays >= 1) {
      return "late-winter";
    }
    return "winter";
  }

  if (calendarSeason === "spring") {
    if ((avgMax !== null && avgMax <= 7) || freezingNights >= 2 || wintryDays >= 1) {
      return "late-winter";
    }
    if ((avgMax !== null && avgMax < 14) || warmDays <= 2) {
      return "early-spring";
    }
    return "spring";
  }

  if (calendarSeason === "summer") {
    if ((avgMax !== null && avgMax < 21) || coolDays >= 4) {
      return "late-summer";
    }
    return hotDays >= 2 ? "summer" : "late-summer";
  }

  if ((avgMax !== null && avgMax <= 8) || freezingNights >= 2 || wintryDays >= 1) {
    return "late-winter";
  }

  if ((avgMax !== null && avgMax < 18) || coolDays >= 4) {
    return "early-autumn";
  }

  if ((avgMax !== null && avgMax >= 22) || (avgMin !== null && avgMin >= 13)) {
    return "late-summer";
  }

  return "autumn";
}

async function getSeason() {
  const manualOverride = getManualOverride();

  try {
    const daily = await fetchForecast();
    const seasonKey = manualOverride || detectWeatherDrivenSeason(daily);
    if (!manualOverride) {
      writeWeatherCache(seasonKey);
    }
    return { seasonKey, daily };
  } catch (error) {
    console.warn("Weather-based season fallback:", error);
    return { seasonKey: manualOverride || readWeatherCache() || meteorologicalSeason(), daily: null };
  }
}

function applySeason(seasonKey) {
  const season = SEASON_CONFIG[seasonKey] || SEASON_CONFIG.winter;

  const root = document.documentElement;
  root.style.setProperty("--accent", season.accent);
  root.style.setProperty("--tint", season.tint);
  root.style.setProperty("--accent-2", season.accent2);
  root.style.setProperty("--hero-image", season.hero);

  document.querySelectorAll(".hero").forEach((hero) => {
    hero.style.setProperty("--hero-image", season.hero);
  });

  document.querySelectorAll("[data-season='label']").forEach((el) => {
    el.textContent = season.label;
  });

  document.querySelectorAll("[data-season='bannerTitle']").forEach((el) => {
    el.textContent = season.bannerTitle;
  });

  document.querySelectorAll("[data-season='bannerText']").forEach((el) => {
    el.textContent = season.bannerText;
  });

  const chipsWrap = document.querySelector("[data-season='featured']");
  if (chipsWrap) {
    chipsWrap.innerHTML = "";
    season.featured.forEach((item) => {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = item;
      chipsWrap.appendChild(span);
    });
  }

  document.querySelectorAll("[data-season='meta']").forEach((el) => {
    el.textContent = `Saison-Look: ${season.label}`;
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  const initialSeason = getInitialSeason();
  applySeason(initialSeason);

  const resolved = await getSeason();
  if (resolved.seasonKey !== initialSeason) {
    applySeason(resolved.seasonKey);
  }
  if (resolved.daily) {
    renderWeatherOutlook(resolved.daily);
    renderWeatherMini(resolved.daily);
  } else {
    renderWeatherOutlook({ time: [] });
    renderWeatherMini({ time: [] });
  }
});
