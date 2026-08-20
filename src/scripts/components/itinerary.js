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
    photo: 366,
  });

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
    polaroid.dataset.rotation = normaliseRotation(options.rotation);
    polaroid.style.width = `${FIGMA_SIZE.width * scale}px`;
    polaroid.style.height = `${FIGMA_SIZE.height * scale}px`;

    surface.className = "itinerary-polaroid-surface";
    surface.style.setProperty("--polaroid-scale", scale);

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
    root.replaceChildren(...days.map(create));
    return root.children;
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
  });

  function autoInitialise() {
    const listSelector = "#polaroid-list";
    if (!document.querySelector(listSelector)) return;

    loadItinerary(DATA_URL.href, {
      index: 0,
      selectors: {
        list: listSelector,
        title: "#itinerary-title",
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
