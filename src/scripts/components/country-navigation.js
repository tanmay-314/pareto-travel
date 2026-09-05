import { fetchJson, findCountryMap, observeResize, resolveUrl } from "../lib/component-utils.js";

const DEFAULT_CONFIG_URL = new URL(
  "../../data/components/country-navigation.json",
  import.meta.url,
).href;
const COUNTRY_MAP_FIGMA_WIDTH = 720;
const STAMP_WIDTH = 180;
const STAMP_HEIGHT = 84;
const MAX_ROTATION = 5;
const navigationBehaviorCleanups = new WeakMap();

const STAMP_DOT_POSITIONS = Object.freeze([
  [20, 6], [13, 10], [163, 10], [163, 69],
  [8, 16], [168, 16], [168, 63],
  [6, 24], [170, 24], [6, 32], [170, 32],
  [6, 40], [170, 40], [6, 48], [170, 48],
  [6, 56], [170, 56], [8, 63], [13, 69], [20, 74],
  [68, 6], [68, 74], [116, 6], [116, 74],
  [28, 6], [28, 74], [76, 6], [76, 74],
  [124, 6], [124, 74], [36, 6], [36, 74],
  [84, 6], [84, 74], [132, 6], [132, 74],
  [44, 6], [44, 74], [92, 6], [92, 74],
  [140, 6], [140, 74], [52, 6], [52, 74],
  [100, 6], [100, 74], [148, 6], [148, 74],
  [60, 6], [60, 74], [108, 6], [108, 74],
  [156, 6], [156, 74]
]);

function requiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Country navigation needs a non-empty ${fieldName}.`);
  }

  return value.trim();
}

function positiveNumber(value, fieldName) {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Country navigation needs a positive ${fieldName}.`);
  }

  return value;
}

function nonNegativeNumber(value, fieldName) {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`Country navigation needs a non-negative ${fieldName}.`);
  }

  return value;
}

function normalizeStamp(stamp, index) {
  const fieldName = `stamps[${index}]`;

  if (!stamp || typeof stamp !== "object") {
    throw new Error(`Country navigation needs a valid ${fieldName}.`);
  }

  if (
    !Number.isFinite(stamp.rotation)
    || Math.abs(stamp.rotation) > MAX_ROTATION
  ) {
    throw new Error(`${fieldName}.rotation must be between -5 and 5 degrees.`);
  }

  return {
    label: requiredText(stamp.label, `${fieldName}.label`),
    target: requiredText(stamp.target, `${fieldName}.target`),
    rotation: stamp.rotation,
    x: nonNegativeNumber(stamp.x, `${fieldName}.x`),
    y: nonNegativeNumber(stamp.y, `${fieldName}.y`)
  };
}

function resolveAsset(path, fieldName, baseUrl) {
  const assetUrl = new URL(requiredText(path, fieldName), baseUrl);

  if (assetUrl.origin !== window.location.origin) {
    throw new Error(`${fieldName} must use a local URL.`);
  }

  return assetUrl.href;
}

function normalizeConfig(config, baseUrl) {
  if (!config || typeof config !== "object") {
    throw new Error("Country navigation data must be an object.");
  }

  if (config.schemaVersion !== 2) {
    throw new Error("Country navigation needs schemaVersion 2.");
  }

  if (!Array.isArray(config.stamps) || config.stamps.length === 0) {
    throw new Error("Country navigation needs at least one stamp.");
  }

  return {
    width: positiveNumber(config.width, "width"),
    height: positiveNumber(config.height, "height"),
    countryName: requiredText(config.countryName, "countryName"),
    year: requiredText(config.year, "year"),
    assets: {
      frame: resolveAsset(config.assets?.frame, "assets.frame", baseUrl),
      dot: resolveAsset(config.assets?.dot, "assets.dot", baseUrl),
      arrowLeft: resolveAsset(config.assets?.arrowLeft, "assets.arrowLeft", baseUrl),
      arrowRight: resolveAsset(config.assets?.arrowRight, "assets.arrowRight", baseUrl)
    },
    stamps: config.stamps.map(normalizeStamp)
  };
}

function createDecorativeLayer(className, property, href) {
  const layer = document.createElement("span");
  layer.className = className;
  layer.style.setProperty(property, `url("${href}")`);
  layer.setAttribute("aria-hidden", "true");
  return layer;
}

function createStampDots(dotUrl) {
  return STAMP_DOT_POSITIONS.map(([x, y]) => {
    const dot = createDecorativeLayer(
      "country-navigation-stamp-dot",
      "--stamp-dot-image",
      dotUrl
    );
    dot.style.setProperty("--stamp-dot-x", `${(x / STAMP_WIDTH) * 100}%`);
    dot.style.setProperty("--stamp-dot-y", `${(y / STAMP_HEIGHT) * 100}%`);
    return dot;
  });
}

function createStamp(stamp, config) {
  const link = document.createElement("a");
  link.className = "country-navigation-stamp";
  link.href = stamp.target;
  link.dataset.label = stamp.label;
  link.style.left = `${stamp.x}px`;
  link.style.top = `${stamp.y}px`;
  link.style.width = `${STAMP_WIDTH}px`;
  link.style.height = `${STAMP_HEIGHT}px`;
  link.style.setProperty("--stamp-rotation", `${stamp.rotation}deg`);
  link.setAttribute("aria-label", `Jump to ${stamp.label}`);

  const content = document.createElement("span");
  content.className = "country-navigation-stamp-content";

  const frame = createDecorativeLayer(
    "country-navigation-stamp-frame",
    "--stamp-frame-image",
    config.assets.frame
  );

  const label = document.createElement("span");
  label.className = "country-navigation-stamp-label";
  label.textContent = stamp.label;

  const leftArrow = createDecorativeLayer(
    "country-navigation-stamp-arrow country-navigation-stamp-arrow--left",
    "--stamp-arrow-image",
    config.assets.arrowLeft
  );
  const rightArrow = createDecorativeLayer(
    "country-navigation-stamp-arrow country-navigation-stamp-arrow--right",
    "--stamp-arrow-image",
    config.assets.arrowRight
  );

  const meta = document.createElement("span");
  meta.className = "country-navigation-stamp-meta";

  const country = document.createElement("span");
  country.textContent = config.countryName;

  const year = document.createElement("span");
  year.textContent = config.year;

  meta.append(country, year);
  content.append(frame, ...createStampDots(config.assets.dot), label, leftArrow, meta, rightArrow);
  link.append(content);
  return link;
}

function setCurrentStamp(navigation, currentLink) {
  navigation
    .querySelectorAll(".country-navigation-stamp[aria-current]")
    .forEach((stamp) => stamp.removeAttribute("aria-current"));
  currentLink?.setAttribute("aria-current", "location");
}

function addNavigationBehavior(navigation) {
  navigationBehaviorCleanups.get(navigation)?.();

  const links = [...navigation.querySelectorAll(".country-navigation-stamp")];
  const sections = links
    .map((link) => ({ link, section: document.querySelector(link.hash) }))
    .filter(({ section }) => section);

  const handleClick = (event) => {
    const link = event.target.closest(".country-navigation-stamp");
    if (!link || !navigation.contains(link)) return;

    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
    history.replaceState(null, "", link.hash);
    setCurrentStamp(navigation, link);

    navigation.dispatchEvent(
      new CustomEvent("country-navigation:select", {
        bubbles: true,
        detail: { target: link.hash, label: link.dataset.label }
      })
    );
  };

  let frame = 0;
  const updateCurrentSection = () => {
    frame = 0;
    const activationLine = window.innerHeight * 0.35;
    let current = null;
    let currentTop = -Infinity;

    sections.forEach((entry) => {
      const sectionTop = entry.section.getBoundingClientRect().top;
      if (sectionTop <= activationLine && sectionTop > currentTop) {
        current = entry.link;
        currentTop = sectionTop;
      }
    });

    setCurrentStamp(navigation, current);
  };

  const scheduleCurrentSectionUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(updateCurrentSection);
  };

  navigation.addEventListener("click", handleClick);
  window.addEventListener("scroll", scheduleCurrentSectionUpdate, { passive: true });
  window.addEventListener("resize", scheduleCurrentSectionUpdate);
  updateCurrentSection();

  navigationBehaviorCleanups.set(navigation, () => {
    navigation.removeEventListener("click", handleClick);
    window.removeEventListener("scroll", scheduleCurrentSectionUpdate);
    window.removeEventListener("resize", scheduleCurrentSectionUpdate);
    if (frame) window.cancelAnimationFrame(frame);
  });
}

function syncNavigationToCountryMap(navigation, config) {
  const map = findCountryMap(navigation);

  if (!map) return;

  observeResize(navigation, map, () => {
    const mapWidth = map.getBoundingClientRect().width;
    if (mapWidth <= 0) return;

    const scale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
    navigation.style.width = `${config.width * scale}px`;
    navigation.style.height = `${config.height * scale}px`;
    navigation.style.setProperty("--country-nav-scale", scale);
  });
}

async function renderCountryNavigation(navigation) {
  const configUrl = navigation.dataset.config || DEFAULT_CONFIG_URL;

  try {
    const resolvedConfigUrl = resolveUrl(configUrl);
    const data = await fetchJson(resolvedConfigUrl, {
      label: "Country navigation data",
    });
    const config = normalizeConfig(data, new URL(".", resolvedConfigUrl));
    const surface = document.createElement("div");
    surface.className = "country-navigation-surface";
    surface.style.width = `${config.width}px`;
    surface.style.height = `${config.height}px`;
    surface.append(...config.stamps.map((stamp) => createStamp(stamp, config)));

    navigation.replaceChildren(surface);
    syncNavigationToCountryMap(navigation, config);
    addNavigationBehavior(navigation);
    navigation.dataset.status = "ready";
  } catch (error) {
    console.error("CountryNavigation:", error);
    navigation.dataset.status = "error";
  }
}

export function loadCountryNavigations(scope = document) {
  return Promise.all(
    [...scope.querySelectorAll("[data-country-navigation]")].map(
      renderCountryNavigation,
    ),
  );
}

export { renderCountryNavigation };
