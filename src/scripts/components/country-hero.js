import { fetchJson } from "../lib/component-utils.js";

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

function normalizePosition(position, fieldName) {
  for (const coordinate of ["x", "y"]) {
    const value = position?.[coordinate];
    if (!Number.isFinite(value) || value < 0 || value > MAP_COORDINATE_SIZE) {
      throw new Error(
        `Country hero data needs ${fieldName}.${coordinate} between 0 and ${MAP_COORDINATE_SIZE}.`,
      );
    }
  }
  return { x: position.x, y: position.y };
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

  const position = normalizePosition(location, fieldName);
  const labelPosition = location.labelPosition == null
    ? null
    : normalizePosition(location.labelPosition, `${fieldName}.labelPosition`);
  if (labelPosition) {
    const lineHeight = location.labelPosition.lineHeight ?? 24;
    if (lineHeight !== 22 && lineHeight !== 24) {
      throw new Error(`Country hero data needs a valid ${fieldName}.labelPosition.lineHeight.`);
    }
    labelPosition.lineHeight = lineHeight;
  }
  let connector = null;
  if (location.connector != null) {
    const origin = normalizePosition(location.connector, `${fieldName}.connector`);
    const dots = location.connector.dots;
    if (!Number.isInteger(dots) || dots < 1 || dots > 60 || origin.x + (dots - 1) * 12 + 6 > MAP_COORDINATE_SIZE) {
      throw new Error(`Country hero data needs a valid ${fieldName}.connector.dots.`);
    }
    connector = { ...origin, dots };
  }

  const href = location.href == null
    ? null
    : requiredText(location.href, `${fieldName}.href`);

  return {
    id: requiredText(location.id, `${fieldName}.id`),
    label: requiredText(location.label, `${fieldName}.label`),
    icon,
    state,
    ...position,
    labelPosition,
    connector,
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

function renderNormalizedCountryHero(root, config) {
  const name = root.querySelector("[data-country-name]");
  const overview = root.querySelector("[data-country-overview]");
  const map = root.querySelector("[data-country-map]");
  const mapShape = root.querySelector("[data-country-map-shape]");
  const locations = root.querySelector("[data-country-map-locations]");

  if (!name || !overview || !map || !mapShape || !locations) {
    throw new Error("Country hero markup is missing a required mount point.");
  }

  name.textContent = config.name;
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

  if (location.labelPosition) {
    label.classList.add("country-map-marker-label--offset");
    label.style.left = `${((location.labelPosition.x - location.x) / MAP_COORDINATE_SIZE) * 100}cqw`;
    label.style.top = `${((location.labelPosition.y - location.y) / MAP_COORDINATE_SIZE) * 100}cqw`;
    label.style.lineHeight = location.labelPosition.lineHeight / 18;
  }

  marker.append(icon, label);
  if (location.connector) {
    const connector = document.createElement("span");
    connector.className = "country-map-marker-connector";
    connector.setAttribute("aria-hidden", "true");
    connector.style.left = `${((location.connector.x - location.x) / MAP_COORDINATE_SIZE) * 100}cqw`;
    connector.style.top = `${((location.connector.y - location.y) / MAP_COORDINATE_SIZE) * 100}cqw`;
    for (let i = 0; i < location.connector.dots; i += 1) {
      connector.append(document.createElement("span"));
    }
    marker.append(connector);
  }
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
    const data = await fetchJson(source, { label: "Country hero data" });
    renderCountryHero(root, data, new URL(source, document.baseURI));
  } catch (error) {
    root.removeAttribute("aria-busy");
    root.dataset.state = "fallback";
    console.error("CountryHero:", error);
  }
}

export function loadCountryHeroes(scope = document) {
  return Promise.all(
    [...scope.querySelectorAll("[data-country-hero]")].map(mountCountryHero),
  );
}
