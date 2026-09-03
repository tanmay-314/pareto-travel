const sourceCache = new Map();

const STAR_COUNT = 5;
const STAR_TO_MAP_SIZE_RATIO = 1 / 24;
const ratingResizeCleanups = new WeakMap();
const STAR_ASSETS = Object.freeze({
  primary: new URL(
    "../../assets/components/country-rating/icon-star.svg",
    import.meta.url,
  ).href,
  partial: new URL(
    "../../assets/components/country-rating/icon-star-partial.svg",
    import.meta.url,
  ).href,
  tertiary: new URL(
    "../../assets/components/country-rating/icon-star-tertiary.svg",
    import.meta.url,
  ).href,
});

function requiredText(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Country rating data needs a non-empty ${fieldName}.`);
  }

  return value.trim();
}

function normalizeRating(rating, index) {
  const fieldName = `ratings[${index}]`;

  if (!rating || typeof rating !== "object") {
    throw new Error(`Country rating data needs a valid ${fieldName}.`);
  }

  if (
    !Number.isFinite(rating.score)
    || rating.score < 0
    || rating.score > STAR_COUNT
    || !Number.isInteger(rating.score * 2)
  ) {
    throw new Error(
      `Country rating data needs ${fieldName}.score between 0 and 5 in half-star steps.`,
    );
  }

  return {
    id: requiredText(rating.id, `${fieldName}.id`),
    label: requiredText(rating.label, `${fieldName}.label`),
    score: rating.score,
  };
}

function normalizeRatings(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.ratings)) {
    throw new Error("Country rating data needs a ratings array.");
  }

  if (data.ratings.length !== STAR_COUNT) {
    throw new Error("Country rating data needs exactly five rating categories.");
  }

  return data.ratings.map(normalizeRating);
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

function getStarState(score, index) {
  if (index < Math.floor(score)) {
    return "primary";
  }

  if (index === Math.floor(score) && score % 1 === 0.5) {
    return "partial";
  }

  return "tertiary";
}

function createRatingRow(rating) {
  const row = document.createElement("div");
  row.className = "country-rating__row";
  row.dataset.ratingId = rating.id;

  const descriptor = document.createElement("dt");
  descriptor.className = "country-rating__descriptor";
  descriptor.textContent = rating.label;

  const stars = document.createElement("dd");
  stars.className = "country-rating__stars";
  stars.setAttribute("role", "img");
  stars.setAttribute(
    "aria-label",
    `${rating.label}: ${rating.score} out of ${STAR_COUNT} stars`,
  );

  for (let index = 0; index < STAR_COUNT; index += 1) {
    const state = getStarState(rating.score, index);
    const star = document.createElement("img");
    star.className = `country-rating__star country-rating__star--${state}`;
    star.src = STAR_ASSETS[state];
    star.alt = "";
    star.width = 30;
    star.height = 30;
    star.setAttribute("aria-hidden", "true");
    stars.append(star);
  }

  row.append(descriptor, stars);
  return row;
}

function syncStarSizeToCountryMap(root) {
  const map = document.querySelector("[data-country-map]");
  ratingResizeCleanups.get(root)?.();

  if (!map) return;

  const updateSize = (mapWidth = map.getBoundingClientRect().width) => {
    if (mapWidth <= 0) return;

    const starSize = mapWidth * STAR_TO_MAP_SIZE_RATIO;
    root.style.setProperty("--country-rating-star-size", `${starSize}px`);
    root.style.setProperty(
      "--country-rating-stars-width",
      `${starSize * STAR_COUNT}px`,
    );
  };

  updateSize();

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width);
    });
    observer.observe(map);
    ratingResizeCleanups.set(root, () => observer.disconnect());
    return;
  }

  const handleResize = () => updateSize();
  window.addEventListener("resize", handleResize);
  ratingResizeCleanups.set(root, () => {
    window.removeEventListener("resize", handleResize);
  });
}

export function renderCountryRating(root, data) {
  const ratings = normalizeRatings(data);
  const list = document.createElement("dl");
  list.className = "country-rating__list";
  list.append(...ratings.map(createRatingRow));
  root.replaceChildren(list);
  syncStarSizeToCountryMap(root);
  root.removeAttribute("aria-busy");
  root.dataset.state = "ready";
}

export async function mountCountryRating(root) {
  const source = root.dataset.source;

  if (!source) {
    throw new Error("Country rating needs a data-source attribute.");
  }

  root.setAttribute("aria-busy", "true");

  try {
    const data = await loadSource(source);
    renderCountryRating(root, data);
  } catch (error) {
    root.removeAttribute("aria-busy");
    root.dataset.state = "fallback";
    console.error("CountryRating:", error);
  }
}

export function loadCountryRatings() {
  return Promise.all(
    [...document.querySelectorAll("[data-country-rating]")].map(mountCountryRating),
  );
}

window.CountryRating = Object.freeze({
  render: renderCountryRating,
  mount: mountCountryRating,
  loadAll: loadCountryRatings,
});

loadCountryRatings();
