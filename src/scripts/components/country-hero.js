const sourceCache = new Map();

const ICONS = Object.freeze({
  "map-pin": new URL("../../assets/icons/icon-map-pin.svg", import.meta.url).href,
  airplane: new URL("../../assets/icons/icon-airplane.svg", import.meta.url).href,
  xmark: new URL("../../assets/icons/icon-xmark.svg", import.meta.url).href,
});

const MAP_COORDINATE_SIZE = 720;
const LOCATION_STATES = new Set(["primary", "secondary"]);

function requiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Country hero data needs a non-empty ${fieldName}.`);
  }

  return value.trim();
}

function normalizeLocation(location, index) {
  const fieldName = `map.locations[${index}]`;

  if (!location || typeof location !== "object") {
    throw new Error(`Country hero data needs a valid ${fieldName}.`);
  }

  const icon = requiredText(location.icon, `${fieldName}.icon`);
  const state = requiredText(location.state, `${fieldName}.state`);

  if (!Object.hasOwn(ICONS, icon)) {
    throw new Error(`Country hero data has an unsupported ${fieldName}.icon.`);
  }

  if (!LOCATION_STATES.has(state)) {
    throw new Error(`Country hero data has an unsupported ${fieldName}.state.`);
  }

  for (const coordinate of ["x", "y"]) {
    const value = location[coordinate];

    if (!Number.isFinite(value) || value < 0 || value > MAP_COORDINATE_SIZE) {
      throw new Error(
        `Country hero data needs ${fieldName}.${coordinate} between 0 and ${MAP_COORDINATE_SIZE}.`,
      );
    }
  }

  const href = location.href == null
    ? null
    : requiredText(location.href, `${fieldName}.href`);

  return {
    id: requiredText(location.id, `${fieldName}.id`),
    label: requiredText(location.label, `${fieldName}.label`),
    icon,
    state,
    x: location.x,
    y: location.y,
    href,
  };
}

function normalizeConfig(data, source) {
  if (!data || typeof data !== "object") {
    throw new Error("Country hero data must be an object.");
  }

  const mapSource = requiredText(data.map?.src, "map.src");
  const resolvedMapSource = new URL(mapSource, source);

  if (resolvedMapSource.origin !== window.location.origin) {
    throw new Error("Country hero map assets must use a local URL.");
  }

  return {
    name: requiredText(data.name, "name"),
    subtitle: requiredText(data.subtitle, "subtitle"),
    overview: requiredText(data.overview, "overview"),
    map: {
      src: resolvedMapSource.href,
      alt: requiredText(data.map?.alt, "map.alt"),
      locations: Array.isArray(data.map?.locations)
        ? data.map.locations.map(normalizeLocation)
        : [],
    },
  };
}

function loadSource(source) {
  if (!sourceCache.has(source)) {
    sourceCache.set(
      source,
      fetch(source).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${source} (${response.status}).`);
        }

        return response.json();
      }),
    );
  }

  return sourceCache.get(source);
}

function renderNormalizedCountryHero(root, config) {
  const name = root.querySelector("[data-country-name]");
  const subtitle = root.querySelector("[data-country-subtitle]");
  const overview = root.querySelector("[data-country-overview]");
  const map = root.querySelector("[data-country-map]");
  const mapShape = root.querySelector("[data-country-map-shape]");
  const locations = root.querySelector("[data-country-map-locations]");

  if (!name || !subtitle || !overview || !map || !mapShape || !locations) {
    throw new Error("Country hero markup is missing a required mount point.");
  }

  name.textContent = config.name;
  subtitle.textContent = config.subtitle;
  overview.textContent = config.overview;
  map.style.setProperty("--map-image", `url("${config.map.src}")`);
  map.setAttribute("aria-label", `Destinations in ${config.name}`);
  mapShape.setAttribute("aria-label", config.map.alt);
  locations.replaceChildren(...config.map.locations.map(createMapMarker));
  root.removeAttribute("aria-busy");
  root.dataset.state = "ready";
}

function createMapMarker(location) {
  const marker = document.createElement(location.href ? "a" : "div");
  marker.className = `country-map-marker country-map-marker--${location.state}`;
  marker.dataset.locationId = location.id;
  marker.style.setProperty("--marker-x", `${(location.x / MAP_COORDINATE_SIZE) * 100}%`);
  marker.style.setProperty("--marker-y", `${(location.y / MAP_COORDINATE_SIZE) * 100}%`);
  marker.style.setProperty("--marker-icon", `url("${ICONS[location.icon]}")`);

  if (location.href) {
    marker.href = location.href;
  }

  const icon = document.createElement("span");
  icon.className = "country-map-marker-icon";
  icon.setAttribute("aria-hidden", "true");

  const label = document.createElement("span");
  label.className = "country-map-marker-label";
  label.textContent = location.label;

  marker.append(icon, label);
  return marker;
}

export function renderCountryHero(root, data, source = document.baseURI) {
  const sourceUrl = source instanceof URL ? source : new URL(source, document.baseURI);
  renderNormalizedCountryHero(root, normalizeConfig(data, sourceUrl));
}

export async function mountCountryHero(root) {
  const source = root.dataset.source;

  if (!source) {
    throw new Error("Country hero needs a data-source attribute.");
  }

  root.setAttribute("aria-busy", "true");

  try {
    const data = await loadSource(source);
    renderCountryHero(root, data, new URL(source, document.baseURI));
  } catch (error) {
    root.removeAttribute("aria-busy");
    root.dataset.state = "fallback";
    console.error("CountryHero:", error);
  }
}

export function loadCountryHeroes() {
  return Promise.all(
    [...document.querySelectorAll("[data-country-hero]")].map(mountCountryHero),
  );
}

window.CountryHero = Object.freeze({
  render: renderCountryHero,
  mount: mountCountryHero,
  loadAll: loadCountryHeroes,
});

loadCountryHeroes();
