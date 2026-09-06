import {
  fetchJson,
  findCountryMap,
  observeResize,
} from "../lib/component-utils.js";

const RATING_TO_MAP_WIDTH_RATIO = 5 / 6;

const RATING_PARAMETERS = Object.freeze([
  Object.freeze({ id: "culture", label: "Culture" }),
  Object.freeze({ id: "nature", label: "Nature" }),
  Object.freeze({ id: "adventure", label: "Adventure" }),
  Object.freeze({ id: "city-life", label: "City Life" }),
  Object.freeze({ id: "food", label: "Food" }),
  Object.freeze({ id: "safety", label: "Safety" }),
]);

const RATING_STATES = new Set(["great", "good", "not-great"]);
const RATING_LABELS = Object.freeze({
  great: "great",
  good: "good",
  "not-great": "not great",
});

const ICON_ASSETS = Object.freeze({
  info: new URL(
    "../../assets/icons/icon-i.svg",
    import.meta.url,
  ).href,
  heart: new URL(
    "../../assets/icons/icon-heart.svg",
    import.meta.url,
  ).href,
});

function normalizeRatings(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.ratings)) {
    throw new Error("Country rating data needs a ratings array.");
  }

  if (data.ratings.length !== RATING_PARAMETERS.length) {
    throw new Error("Country rating data needs exactly six rating parameters.");
  }

  return RATING_PARAMETERS.map((parameter, index) => {
    const rating = data.ratings[index];

    if (!rating || typeof rating !== "object") {
      throw new Error(`Country rating data needs a valid ratings[${index}].`);
    }

    if (rating.id !== parameter.id) {
      throw new Error(
        `Country rating ratings[${index}].id must be "${parameter.id}".`,
      );
    }

    if (!RATING_STATES.has(rating.rating)) {
      throw new Error(
        `Country rating "${parameter.id}" must be great, good, or not-great.`,
      );
    }

    return { ...parameter, rating: rating.rating };
  });
}

function createRatingTile(parameter) {
  const tile = document.createElement("li");
  tile.className = `country-rating__tile country-rating__tile--${parameter.rating}`;
  tile.dataset.ratingId = parameter.id;
  tile.setAttribute(
    "aria-label",
    `${parameter.label}: ${RATING_LABELS[parameter.rating]}`,
  );

  const content = document.createElement("span");
  content.className = "country-rating__tile-content";
  content.setAttribute("aria-hidden", "true");

  const ring = document.createElement("img");
  ring.className = "country-rating__ring";
  ring.src = new URL(
    "../../assets/components/faq-quick-reference/dotted-ring.svg",
    import.meta.url,
  ).href;
  ring.alt = "";
  ring.width = 182;
  ring.height = 184;

  const icons = document.createElement("span");
  icons.className = "country-rating__icons";

  const info = document.createElement("span");
  info.className = "country-rating__icon country-rating__icon--info";
  info.style.setProperty("--rating-icon", `url("${ICON_ASSETS.info}")`);

  const heart = document.createElement("span");
  heart.className = "country-rating__icon country-rating__icon--heart";
  heart.style.setProperty("--rating-icon", `url("${ICON_ASSETS.heart}")`);

  const label = document.createElement("span");
  label.className = "country-rating__label";
  label.textContent = parameter.label.toUpperCase();

  icons.append(info, heart);
  content.append(ring, icons, label);
  tile.append(content);
  return tile;
}

function syncToCountryMap(root) {
  const map = findCountryMap(root);

  if (!map) return;

  observeResize(root, map, () => {
    const mapWidth = map.getBoundingClientRect().width;
    if (mapWidth <= 0) return;

    root.style.setProperty(
      "--country-rating-width",
      `${mapWidth * RATING_TO_MAP_WIDTH_RATIO}px`,
    );
  });
}

export function renderCountryRating(root, data) {
  const ratings = normalizeRatings(data);
  const list = document.createElement("ul");
  list.className = "country-rating__list";
  list.setAttribute("aria-label", "Travel ratings");
  list.append(...ratings.map(createRatingTile));
  root.replaceChildren(list);
  root.removeAttribute("aria-busy");
  root.dataset.state = "ready";
  syncToCountryMap(root);
}

export async function mountCountryRating(root) {
  const source = root.dataset.source;

  if (!source) {
    throw new Error("Country rating needs a data-source attribute.");
  }

  root.setAttribute("aria-busy", "true");

  try {
    const data = await fetchJson(source, { label: "Country rating data" });
    renderCountryRating(root, data);
  } catch (error) {
    root.removeAttribute("aria-busy");
    root.dataset.state = "fallback";
    console.error("CountryRating:", error);
  }
}

export function loadCountryRatings(scope = document) {
  return Promise.all(
    [...scope.querySelectorAll("[data-country-rating]")].map(mountCountryRating),
  );
}
