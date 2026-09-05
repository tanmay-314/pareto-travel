import {
  loadAnnualTravelDials,
  renderAnnualTravelDial,
  setDialCountry,
} from "./components/best-months.js";
import {
  DEFAULT_RECEIPT,
  createReceipt,
  loadBudgetReceipts,
  mountBudgetReceipt,
} from "./components/budget.js";
import {
  loadCountryHeroes,
  mountCountryHero,
  renderCountryHero,
} from "./components/country-hero.js";
import { loadCountryNavigations } from "./components/country-navigation.js";
import {
  loadCountryRatings,
  mountCountryRating,
  renderCountryRating,
} from "./components/country-rating.js";
import {
  initCuisine,
  loadCuisines,
  renderCuisine,
} from "./components/cuisine.js";
import {
  init as initFaqs,
  initAll as initAllFaqs,
  render as renderFaqs,
} from "./components/faqs.js";
import {
  mount as mountInterCityTravel,
  mountAll as mountAllInterCityTravel,
  render as renderInterCityTravel,
  validateData as validateInterCityTravelData,
} from "./components/inter-city-travel.js";
import {
  ALLOWED_ROTATIONS,
  create as createPolaroid,
  initialiseItinerary,
  loadItinerary,
  mount as mountPolaroid,
  renderItinerary,
  renderPage as renderItineraryPage,
  syncToCountryMap,
} from "./components/itinerary.js";
import { fetchJson, onDomReady } from "./lib/component-utils.js";

const COUNTRY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function requiredMount(scope, selector) {
  const mount = scope.querySelector(selector);

  if (!mount) {
    throw new Error(`Country page markup is missing ${selector}.`);
  }

  return mount;
}

function requiredCountryText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Country data needs a non-empty ${fieldName}.`);
  }

  return value.trim();
}

function validateCountry(country, slug) {
  if (!country || typeof country !== "object") {
    throw new Error("Country data must be an object.");
  }

  if (country.slug !== slug) {
    throw new Error(`Country data slug does not match "${slug}".`);
  }

  if (country.status !== "published") {
    throw new Error(`Country "${slug}" is not published.`);
  }

  if (!Number.isInteger(country.visitedYear)) {
    throw new Error("Country data needs an integer visitedYear.");
  }

  return {
    ...country,
    name: requiredCountryText(country.name, "name"),
  };
}

function setSource(scope, selector, source) {
  requiredMount(scope, selector).dataset.source = source;
}

export async function configureCountryPage(scope = document) {
  const slug = document.documentElement.dataset.countrySlug;

  if (!COUNTRY_SLUG_PATTERN.test(slug || "")) {
    throw new Error("The country page has an invalid or missing slug.");
  }

  const dataBaseUrl = new URL(`../data/countries/${slug}/`, import.meta.url);
  const source = (filename) => new URL(filename, dataBaseUrl).href;
  const countrySource = source("country.json");
  const country = validateCountry(
    await fetchJson(countrySource, { label: "Country data" }),
    slug,
  );

  document.title = country.seo?.title || `${country.name} | Pareto Travel`;

  const description = document.querySelector('meta[name="description"]');
  if (description && typeof country.seo?.description === "string") {
    description.content = country.seo.description;
  }

  setSource(scope, "[data-country-hero]", countrySource);
  setSource(scope, "[data-itinerary]", source("itinerary.json"));
  setSource(scope, ".annual-travel-dial", source("best-months.json"));
  setSource(scope, "[data-cuisine-component]", source("cuisine.json"));
  setSource(
    scope,
    "[data-inter-city-travel]",
    source("inter-city-travel.json"),
  );
  setSource(scope, "[data-budget-receipt]", source("budget.json"));
  setSource(scope, "[data-faqs]", source("faqs.json"));

  const dial = requiredMount(scope, ".annual-travel-dial");
  dial.dataset.country = slug;

  const faqs = requiredMount(scope, "[data-faqs]");
  faqs.dataset.countrySource = countrySource;

  const navigation = requiredMount(scope, "[data-country-navigation]");
  navigation.dataset.countryName = country.name;
  navigation.dataset.year = String(country.visitedYear);

  document.documentElement.dataset.countryStatus = "ready";
  return country;
}

export function renderCountryUnavailable(error, scope = document) {
  const main = scope.querySelector("#main-content");
  document.title = "Country unavailable | Pareto Travel";
  document.documentElement.dataset.countryStatus = "error";

  if (main) {
    const section = document.createElement("section");
    section.className = "country-unavailable";

    const title = document.createElement("h1");
    title.className = "country-unavailable__title country-sub-heading";
    title.textContent = "COUNTRY GUIDE UNAVAILABLE";

    const message = document.createElement("p");
    message.className = "country-unavailable__message";
    message.setAttribute("role", "alert");
    message.textContent =
      "We could not load this country guide. Return to the destinations map and try another country.";

    const link = document.createElement("a");
    link.className = "country-unavailable__link";
    link.href = "../pages/index.html";
    link.textContent = "Back to destinations";

    section.append(title, message, link);
    main.replaceChildren(section);
  }

  console.error("CountryPage:", error);
}

function exposeDebugApis() {
  window.AnnualTravelDial = {
    render: renderAnnualTravelDial,
    setCountry: setDialCountry,
    loadAll: loadAnnualTravelDials,
  };
  window.BudgetReceipt = Object.freeze({
    defaults: DEFAULT_RECEIPT,
    create: createReceipt,
    mount: mountBudgetReceipt,
  });
  window.CountryHero = Object.freeze({
    render: renderCountryHero,
    mount: mountCountryHero,
    loadAll: loadCountryHeroes,
  });
  window.CountryRating = Object.freeze({
    render: renderCountryRating,
    mount: mountCountryRating,
    loadAll: loadCountryRatings,
  });
  window.ParetoCuisine = {
    render: renderCuisine,
    init: initCuisine,
  };
  window.InterCityTravel = Object.freeze({
    mount: mountInterCityTravel,
    render: renderInterCityTravel,
    validateData: validateInterCityTravelData,
  });
  window.ParetoPolaroid = Object.freeze({
    allowedRotations: ALLOWED_ROTATIONS,
    create: createPolaroid,
    mount: mountPolaroid,
    renderItinerary,
    renderPage: renderItineraryPage,
    loadItinerary,
    syncToCountryMap,
  });
  window.ParetoEditorialFaqs = Object.freeze({
    init: initFaqs,
    initAll: initAllFaqs,
    render: renderFaqs,
  });
}

export async function initializeCountryPage(scope = document) {
  exposeDebugApis();

  const initializers = [
    ["CountryHero", () => loadCountryHeroes(scope)],
    ["CountryNavigation", () => loadCountryNavigations(scope)],
    ["ParetoPolaroid", () => initialiseItinerary(scope)],
    ["InterCityTravel", () => mountAllInterCityTravel(scope)],
    ["AnnualTravelDial", () => loadAnnualTravelDials(scope)],
    ["BudgetReceipt", () => loadBudgetReceipts(scope)],
    ["ParetoCuisine", () => loadCuisines(scope)],
    ["ParetoEditorialFaqs", () => initAllFaqs(scope)],
  ];

  return Promise.all(
    initializers.map(async ([label, initialize]) => {
      try {
        return await initialize();
      } catch (error) {
        console.error(`${label}:`, error);
        return null;
      }
    }),
  );
}

onDomReady(async () => {
  try {
    await configureCountryPage();
    await initializeCountryPage();
  } catch (error) {
    renderCountryUnavailable(error);
  }
});
