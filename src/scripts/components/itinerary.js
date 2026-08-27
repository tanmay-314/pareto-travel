(function (global) {
  "use strict";

  const DATA_URL = new URL(
    "../../data/countries/cambodia/itinerary.json",
    import.meta.url,
  );

  const FRAME_URL = new URL(
    "../../assets/components/itinerary/polaroid-frame.svg",
    import.meta.url,
  );

  const ALLOWED_ROTATIONS = Object.freeze([
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

  function create(config) {
    const options = { ...DEFAULTS, ...config };
    const imageOptions = normaliseImage(options);
    const scale = imageOptions.size / FIGMA_SIZE.photo;
    const polaroid = document.createElement("article");
    const surface = document.createElement("div");
    const tilt = document.createElement("div");
    const photo = document.createElement("div");
    const frame = document.createElement("img");
    const caption = document.createElement("div");

    polaroid.className = "itinerary-polaroid";
    polaroid.setAttribute("role", "listitem");
    polaroid.dataset.rotation = normaliseRotation(options.rotation);
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

  function mount(target, config) {
    const root =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!root) throw new Error("Polaroid mount target was not found.");
    const element = create(config);
    root.append(element);
    return element;
  }

  function renderItinerary(target, days) {
    const root =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!root) throw new Error("Itinerary mount target was not found.");
    const count = days.length;
    const divisor = Math.max(count - 1, 1);
    const cards = days.map((day, index) => {
      const card = create(day);
      const offset = count > 1 ? (FIGMA_SIZE.stackTravel * index) / divisor : 0;
      const scale =
        Number.parseFloat(
          root.style.getPropertyValue("--itinerary-stack-scale"),
        ) || 1;
      card.style.setProperty("--itinerary-card-z", count - index);
      card.dataset.stackOffset = offset;
      card.style.setProperty("--itinerary-card-x", `${offset * scale}px`);
      return card;
    });

    root.dataset.dayCount = count;
    root.replaceChildren(...cards);
    return root.children;
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

  function syncToCountryMap(target, mapTarget) {
    const root =
      typeof target === "string" ? document.querySelector(target) : target;
    const map =
      typeof mapTarget === "string"
        ? document.querySelector(mapTarget)
        : mapTarget;

    if (!root || !map) return null;

    const layoutContainer = root.parentElement;

    const updateScale = () => {
      const mapWidth = map.getBoundingClientRect().width;
      const availableWidth =
        layoutContainer?.getBoundingClientRect().width || 0;
      if (mapWidth <= 0) return;

      const mapScale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
      const stackWidth = FIGMA_SIZE.width + FIGMA_SIZE.stackTravel;
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
      root.style.setProperty("--itinerary-stack-scale", scale);
      Array.from(root.children).forEach((card) => {
        const offset = Number.parseFloat(card.dataset.stackOffset) || 0;
        card.style.setProperty("--itinerary-card-x", `${offset * scale}px`);
      });
    };

    updateScale();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(updateScale);
      observer.observe(map);
      if (layoutContainer) observer.observe(layoutContainer);
      return () => observer.disconnect();
    }

    const handleResize = () => updateScale();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }

  /*function renderTripFacts(target, itinerary) {
    const root =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!root) return null;

    const facts = [
      ["ROUTE", itinerary.route],
      ["PACE", itinerary.pace],
      ["BEST FOR", itinerary.bestFor],
    ];

    root.replaceChildren(
      ...facts.map(([label, value]) => {
        const group = document.createElement("div");
        const term = document.createElement("dt");
        const description = document.createElement("dd");
        term.textContent = label;
        description.textContent = value;
        group.append(term, description);
        return group;
      }),
    );

    return root;
  }*/

  function renderPage(itinerary, selectors = {}) {
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
    /*renderTripFacts(selectors.facts || "#trip-facts", itinerary);*/
    return renderItinerary(listSelector, itinerary.days);
  }

  async function loadItinerary(source, options = {}) {
    const response = await fetch(source);
    if (!response.ok) {
      throw new Error(`Could not load itinerary data (${response.status}).`);
    }

    const data = await response.json();
    const itineraryIndex = Number.parseInt(options.index, 10) || 0;
    const itinerary = data.itineraries?.[itineraryIndex];

    if (!itinerary) {
      throw new Error(`Itinerary ${itineraryIndex} was not found.`);
    }

    renderPage(itinerary, options.selectors);
    return itinerary;
  }

  global.ParetoPolaroid = Object.freeze({
    allowedRotations: ALLOWED_ROTATIONS,
    create,
    mount,
    renderItinerary,
    renderPage,
    loadItinerary,
    syncToCountryMap,
  });

  function autoInitialise() {
    const listSelector = "#polaroid-list";
    if (!document.querySelector(listSelector)) return;

    syncToCountryMap(listSelector, "[data-country-map]");

    loadItinerary(DATA_URL.href, {
      index: 0,
      selectors: {
        list: listSelector,
        title: "#itinerary-title",
        editorial: "#itinerary-editorial",
        facts: "#trip-facts",
      },
    }).catch((error) => {
      console.error("ParetoPolaroid:", error);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitialise, { once: true });
  } else {
    autoInitialise();
  }
})(window);
