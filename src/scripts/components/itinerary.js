import { fetchJson, findCountryMap, observeResize } from "../lib/component-utils.js";

const DATA_URL = new URL(
  "../../data/countries/cambodia/itinerary.json",
  import.meta.url,
);

const FRAME_URL = new URL(
  "../../assets/components/itinerary/polaroid-frame.svg",
  import.meta.url,
);

export const ALLOWED_ROTATIONS = Object.freeze([
  "0°",
  "-4°",
  "-3°",
  "1°",
  "2°",
  "3°",
]);

const DEFAULTS = Object.freeze({
  dayNumber: "DAY 1",
  location: "LOCATION",
  rotation: "0°",
  image: null,
});

const FIGMA_SIZE = Object.freeze({
  width: 412,
  height: 460,
  photo: 360,
  stackTravel: 360,
});

const COUNTRY_MAP_FIGMA_WIDTH = 720;
const deckCleanups = new WeakMap();
function normaliseRotation(value) {
  const rotation = String(value || DEFAULTS.rotation);
  return ALLOWED_ROTATIONS.includes(rotation)
    ? rotation
    : DEFAULTS.rotation;
}

function rotationToCss(value) {
  const figmaDegrees = Number.parseFloat(normaliseRotation(value));
  return `${figmaDegrees * -1}deg`;
}

function getStackOffset(position, count) {
  return count > 1
    ? (FIGMA_SIZE.stackTravel * position) / (count - 1)
    : 0;
}

function createText(className, text) {
  const node = document.createElement("p");
  node.className = className;
  node.textContent = text;
  return node;
}

function normaliseImage(options) {
  if (typeof options.image === "string") {
    return {
      src: options.image,
      alt: options.imageAlt || "",
      position: options.imagePosition || "50% 50%",
      size:
        Number.isFinite(options.imageSize) && options.imageSize > 0
          ? options.imageSize
          : 360,
    };
  }

  return {
    src: options.image?.src || "",
    alt: options.image?.alt || "",
    position: options.image?.position || "50% 50%",
    size:
      Number.isFinite(options.image?.size) && options.image.size > 0
        ? options.image.size
        : 360,
  };
}

export function create(config, interactive = false) {
  const options = { ...DEFAULTS, ...config };
  const imageOptions = normaliseImage(options);
  const scale = imageOptions.size / FIGMA_SIZE.photo;
  const polaroid = document.createElement("article");
  const surface = document.createElement(interactive ? "button" : "div");
  const tilt = document.createElement("div");
  const photo = document.createElement("div");
  const frame = document.createElement("img");
  const caption = document.createElement("div");

  polaroid.className = "itinerary-polaroid";
  polaroid.setAttribute("role", "listitem");
  polaroid.dataset.itineraryCard = "";
  polaroid.dataset.rotation = normaliseRotation(options.rotation);
  polaroid.dataset.dayLabel = options.dayNumber;
  polaroid.dataset.location = options.location;
  polaroid.style.setProperty("--polaroid-scale", scale);
  polaroid.style.setProperty(
    "--polaroid-width",
    `${FIGMA_SIZE.width * scale}px`,
  );
  polaroid.style.setProperty(
    "--polaroid-height",
    `${FIGMA_SIZE.height * scale}px`,
  );

  surface.className = "itinerary-polaroid-surface";
  if (interactive) {
    surface.type = "button";
    surface.setAttribute(
      "aria-label",
      `Select ${options.dayNumber}: ${options.location}`,
    );
  }

  tilt.className = "itinerary-polaroid-tilt";
  tilt.style.setProperty(
    "--polaroid-rotation",
    rotationToCss(options.rotation),
  );

  photo.className = "itinerary-polaroid-photo";
  if (imageOptions.src) {
    const image = document.createElement("img");
    image.src = imageOptions.src;
    image.alt = imageOptions.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.style.setProperty(
      "--polaroid-image-position",
      imageOptions.position,
    );
    photo.append(image);
  }

  frame.className = "itinerary-polaroid-frame";
  frame.src = options.frameAsset || FRAME_URL.href;
  frame.alt = "";
  frame.setAttribute("aria-hidden", "true");

  caption.className = "itinerary-polaroid-caption";
  caption.append(
    createText("itinerary-polaroid-day", options.dayNumber),
    createText("itinerary-polaroid-location", options.location),
  );

  tilt.append(photo, frame, caption);
  surface.append(tilt);
  polaroid.append(surface);
  return polaroid;
}

export function mount(target, config) {
  const root =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!root) throw new Error("Polaroid mount target was not found.");
  const element = create(config);
  root.append(element);
  return element;
}

export function renderItinerary(target, days) {
  const root =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!root) throw new Error("Itinerary mount target was not found.");
  const count = days.length;
  deckCleanups.get(root)?.();
  const cards = days.map((day, index) => {
    const card = create(day, true);
    const offset = getStackOffset(index, count);
    const scale =
      Number.parseFloat(
        root.style.getPropertyValue("--itinerary-stack-scale"),
      ) || 1;
    card.style.setProperty("--itinerary-card-z", count - index);
    card.style.setProperty("--itinerary-deal-delay", `${index * 100}ms`);
    card.dataset.stackOffset = offset;
    card.dataset.dayIndex = index;
    card.style.setProperty("--itinerary-card-x", `${offset * scale}px`);
    return card;
  });

  root.dataset.dayCount = count;
  root.replaceChildren(...cards);
  if (cards.length) enhanceDeck(root, cards);
  return root.children;
}

function getDayOrdinal(card, fallback) {
  const match = card.dataset.dayLabel?.match(/\d+/);
  return match ? Number.parseInt(match[0], 10) : fallback + 1;
}

function getRestingRotation(card, rank) {
  if (rank === 0) return "0deg";
  if (rank === 1) return rotationToCss("2°");

  const configured = rotationToCss(card.dataset.rotation);
  return configured === "0deg"
    ? rank % 2 === 0
      ? "-4deg"
      : "4deg"
    : configured;
}

function enhanceDeck(root, cards) {
  let activeIndex = 0;
  let isShuffling = false;
  let touchStart = null;
  let suppressClick = false;
  const timers = new Set();
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  );

  const later = (callback, delay) => {
    const timer = window.setTimeout(() => {
      timers.delete(timer);
      callback();
    }, delay);
    timers.add(timer);
    return timer;
  };

  const updateLayout = () => {
    const count = cards.length;
    const order = cards.map((_, rank) => (activeIndex + rank) % count);
    const scale =
      Number.parseFloat(
        root.style.getPropertyValue("--itinerary-stack-scale"),
      ) || 1;

    order.forEach((cardIndex, rank) => {
      const card = cards[cardIndex];
      const control = card.querySelector(".itinerary-polaroid-surface");
      const day = card.querySelector(".itinerary-polaroid-day");
      const ordinal = getDayOrdinal(card, cardIndex);
      const isActive = rank === 0;
      const offset = getStackOffset(rank, count);
      const restingRotation = getRestingRotation(card, rank);
      const rotationValue = Number.parseFloat(restingRotation) || 0;

      card.dataset.stackOffset = offset;
      card.dataset.deckRank = rank;
      card.style.setProperty("--itinerary-card-x", `${offset * scale}px`);
      card.style.setProperty("--itinerary-card-z", count - rank);
      card.style.setProperty(
        "--itinerary-shuffle-delay",
        `${rank * 18}ms`,
      );
      card.style.setProperty("--polaroid-resting-rotation", restingRotation);
      card.style.setProperty(
        "--polaroid-preview-rotation",
        `${rotationValue * 0.35}deg`,
      );
      card.classList.toggle("is-active", isActive);
      control.tabIndex = isActive ? 0 : -1;
      control.setAttribute("aria-pressed", String(isActive));
      control.setAttribute(
        "aria-label",
        isActive
          ? `Day ${ordinal} of ${count} selected: ${card.dataset.location}`
          : `Select day ${ordinal} of ${count}: ${card.dataset.location}`,
      );
      day.textContent = isActive
        ? `DAY ${ordinal} OF ${count}`
        : card.dataset.dayLabel;
    });
  };

  const selectCard = (nextIndex, moveFocus = false) => {
    if (
      isShuffling ||
      nextIndex === activeIndex ||
      nextIndex < 0 ||
      nextIndex >= cards.length
    ) {
      if (moveFocus && nextIndex === activeIndex) {
        cards[activeIndex]
          .querySelector(".itinerary-polaroid-surface")
          ?.focus();
      }
      return;
    }

    isShuffling = true;
    const selectedCard = cards[nextIndex];
    const stageDelay = reduceMotion.matches ? 55 : 100;
    const finishDelay = reduceMotion.matches ? 160 : 580;
    selectedCard.style.setProperty("--itinerary-shuffle-delay", "0ms");
    root.classList.add("is-shuffling");
    selectedCard.classList.add("is-lifting");

    later(() => {
      activeIndex = nextIndex;
      updateLayout();
      selectedCard.classList.remove("is-lifting");
      if (moveFocus) {
        selectedCard
          .querySelector(".itinerary-polaroid-surface")
          ?.focus({ preventScroll: true });
      }
    }, stageDelay);

    later(() => {
      root.classList.remove("is-shuffling");
      isShuffling = false;
    }, finishDelay);
  };

  const handleClick = (event) => {
    const card = event.target.closest("[data-itinerary-card]");
    if (!card || !root.contains(card)) return;
    if (suppressClick) {
      event.preventDefault();
      return;
    }
    selectCard(Number.parseInt(card.dataset.dayIndex, 10));
  };

  const handleKeydown = (event) => {
    if (!event.target.closest(".itinerary-polaroid-surface")) return;
    let nextIndex = activeIndex;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = (activeIndex + 1) % cards.length;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = (activeIndex - 1 + cards.length) % cards.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = cards.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    selectCard(nextIndex, true);
  };

  const handleTouchStart = (event) => {
    if (event.touches.length !== 1) return;
    touchStart = {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  };

  const handleTouchEnd = (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    touchStart = null;

    if (Math.abs(deltaX) < 36 || Math.abs(deltaX) <= Math.abs(deltaY)) {
      return;
    }

    suppressClick = true;
    later(() => {
      suppressClick = false;
    }, 400);
    const direction = deltaX < 0 ? 1 : -1;
    const nextIndex =
      (activeIndex + direction + cards.length) % cards.length;
    selectCard(nextIndex);
  };

  const handleTouchCancel = () => {
    touchStart = null;
  };

  const beginDeal = () => {
    if (root.dataset.dealt === "true") return;
    root.dataset.dealt = "true";
    if (reduceMotion.matches) {
      root.classList.remove("is-awaiting-deal");
      return;
    }
    root.classList.add("is-dealing");
    requestAnimationFrame(() => {
      root.classList.remove("is-awaiting-deal");
    });
    later(() => root.classList.remove("is-dealing"), 650 + cards.length * 100);
  };

  root.classList.add("is-awaiting-deal");
  updateLayout();
  root.addEventListener("click", handleClick);
  root.addEventListener("keydown", handleKeydown);
  root.addEventListener("touchstart", handleTouchStart, { passive: true });
  root.addEventListener("touchend", handleTouchEnd, { passive: true });
  root.addEventListener("touchcancel", handleTouchCancel, { passive: true });

  let dealObserver = null;
  if ("IntersectionObserver" in window) {
    dealObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        dealObserver.disconnect();
        requestAnimationFrame(() => requestAnimationFrame(beginDeal));
      },
      { threshold: 0.18 },
    );
    dealObserver.observe(root);
  } else {
    requestAnimationFrame(beginDeal);
  }

  const cleanup = () => {
    dealObserver?.disconnect();
    timers.forEach((timer) => window.clearTimeout(timer));
    root.removeEventListener("click", handleClick);
    root.removeEventListener("keydown", handleKeydown);
    root.removeEventListener("touchstart", handleTouchStart);
    root.removeEventListener("touchend", handleTouchEnd);
    root.removeEventListener("touchcancel", handleTouchCancel);
    root.classList.remove("is-awaiting-deal", "is-dealing", "is-shuffling");
    delete root.dataset.dealt;
    deckCleanups.delete(root);
  };
  deckCleanups.set(root, cleanup);
}

function renderEditorial(target, itinerary) {
  const root =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!root) return null;

  const paragraphs = Array.isArray(itinerary.editorial)
    ? itinerary.editorial.filter(Boolean)
    : [];
  const content = paragraphs.map((text) =>
    createText("itinerary-editorial-copy", text),
  );

  if (itinerary.detailLink?.label && itinerary.detailLink?.href) {
    const link = document.createElement("a");
    link.className = "itinerary-editorial-link";
    link.href = itinerary.detailLink.href;
    link.textContent = itinerary.detailLink.label;
    content.push(link);
  }

  root.replaceChildren(...content);
  root.hidden = content.length === 0;
  return root;
}

export function syncToCountryMap(target, mapTarget) {
  const root =
    typeof target === "string" ? document.querySelector(target) : target;
  const map =
    typeof mapTarget === "string"
      ? document.querySelector(mapTarget)
      : mapTarget;

  if (!root || !map) return null;

  const layoutContainer = root.parentElement;

  return observeResize(root, [map, layoutContainer], () => {
    const mapWidth = map.getBoundingClientRect().width;
    const availableWidth =
      layoutContainer?.getBoundingClientRect().width || 0;
    if (mapWidth <= 0) return;

    const mapScale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
    const cardCount = root.querySelectorAll("[data-itinerary-card]").length;
    const stackWidth =
      FIGMA_SIZE.width + (cardCount > 1 ? FIGMA_SIZE.stackTravel : 0);
    const availableScale =
      availableWidth > 0 ? availableWidth / stackWidth : mapScale;
    const scale = Math.min(mapScale, availableScale, 1);
    const polaroidWidth = FIGMA_SIZE.width * scale;
    root.style.setProperty(
      "--country-map-polaroid-scale",
      scale,
    );
    root.style.setProperty(
      "--country-map-polaroid-width",
      `${polaroidWidth}px`,
    );
    root.style.setProperty(
      "--country-map-polaroid-height",
      `${FIGMA_SIZE.height * scale}px`,
    );
    root.style.setProperty("--itinerary-deck-offset", "0px");
    root.style.setProperty("--itinerary-stack-scale", scale);
    root.querySelectorAll("[data-itinerary-card]").forEach((card) => {
      const offset = Number.parseFloat(card.dataset.stackOffset) || 0;
      card.style.setProperty("--itinerary-card-x", `${offset * scale}px`);
    });
  });
}

export function renderPage(itinerary, selectors = {}) {
  if (!itinerary || !Array.isArray(itinerary.days)) {
    throw new Error("The itinerary must contain a days array.");
  }

  const listSelector = selectors.list || "#polaroid-list";
  const title = document.querySelector(
    selectors.title || "#itinerary-title",
  );

  if (title) title.textContent = itinerary.title || "ITINERARY";
  renderEditorial(
    selectors.editorial || "#itinerary-editorial",
    itinerary,
  );
  return renderItinerary(listSelector, itinerary.days);
}

export async function loadItinerary(source = DATA_URL.href, options = {}) {
  const data = await fetchJson(source, { label: "Itinerary data" });
  const itineraryIndex = Number.parseInt(options.index, 10) || 0;
  const itinerary = data.itineraries?.[itineraryIndex];

  if (!itinerary) {
    throw new Error(`Itinerary ${itineraryIndex} was not found.`);
  }

  renderPage(itinerary, options.selectors);
  return itinerary;
}

export async function initialiseItinerary(scope = document) {
  const listSelector = "#polaroid-list";
  const list = scope.querySelector(listSelector);
  if (!list) return null;

  const itinerary = await loadItinerary(DATA_URL.href, {
    index: 0,
    selectors: {
      list: listSelector,
      title: "#itinerary-title",
      editorial: "#itinerary-editorial",
    },
  });
  syncToCountryMap(list, findCountryMap(list));
  return itinerary;
}
