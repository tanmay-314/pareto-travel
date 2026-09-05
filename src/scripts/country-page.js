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
import { onDomReady } from "./lib/component-utils.js";

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

onDomReady(() => initializeCountryPage());
