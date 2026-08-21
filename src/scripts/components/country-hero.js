const sourceCache = new Map();

function requiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Country hero data needs a non-empty ${fieldName}.`);
  }

  return value.trim();
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

  if (!name || !subtitle || !overview || !map) {
    throw new Error("Country hero markup is missing a required mount point.");
  }

  name.textContent = config.name;
  subtitle.textContent = config.subtitle;
  overview.textContent = config.overview;
  map.style.setProperty("--map-image", `url("${config.map.src}")`);
  map.setAttribute("aria-label", config.map.alt);
  root.removeAttribute("aria-busy");
  root.dataset.state = "ready";
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
