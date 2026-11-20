import { fetchJson, findCountryMap, observeResize } from "../lib/component-utils.js";
import { renderEditorialCarousel, destroyEditorialCarousel } from "./editorial-carousel.js";

const DEFAULT_DATA = {
  title: "GOING FROM PLACE TO PLACE",
  editorial: [],
  assets: {
    modes: {
      flight: "../assets/icons/icon-flight.svg",
      bus: "../assets/components/inter-city-travel/journey-bus.svg",
      train: "../assets/icons/icon-train.svg",
      car: "../assets/components/inter-city-travel/journey-car.svg",
      none: "../assets/icons/icon-smiley.svg"
    }
  }
};

const JOURNEY_WIDTH = 480;
const JOURNEY_TO_MAP_WIDTH_RATIO = JOURNEY_WIDTH / 720;
const escapeHtml = (value = "") =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const normalizeMode = (mode) => {
  const value = String(mode || "").trim().toLowerCase();
  return ["plane", "air", "airplane"].includes(value) ? "flight" : value;
};

const getModeLabel = (mode) => normalizeMode(mode);

const validateJourney = (data) => {
  if (!data || typeof data !== "object") {
    throw new TypeError("Inter-city data must be an object.");
  }

  if (!Array.isArray(data.places) || !Array.isArray(data.legs)) {
    throw new TypeError("Inter-city data requires places and legs arrays.");
  }

  if (data.places.length === 0 && data.legs.length === 0) return;

  if (data.places.length !== data.legs.length + 1) {
    throw new RangeError("The number of places must be exactly one more than the number of legs.");
  }

  if (data.legs.length === 0) {
    throw new RangeError("Inter-city data requires at least one journey leg.");
  }
};

export const validateData = (data) => {
  validateJourney(data);
  if (data.additionalJourneys !== undefined && !Array.isArray(data.additionalJourneys)) {
    throw new TypeError("Additional journeys must be an array.");
  }
  (data.additionalJourneys || []).forEach(validateJourney);
};

const getJourneys = (data) => [data, ...(data.additionalJourneys || [])];

const hasJourney = (data) => data.places.length > 1 &&
  data.legs.some((leg) => normalizeMode(leg.mode) !== "none");

const renderJourney = (data, assets) => {
  const dot = (x, y) => `<img class="inter-city-route-dot" src="../assets/components/inter-city-travel/route-dot.svg" alt="" width="6" height="6" style="left:${x}px;top:${y}px">`;
  const legs = data.legs.map((leg, index) => {
    const leftward = index % 2 === 1;
    const y = 60 + index * 84;
    const mode = normalizeMode(leg.mode);
    const duration = String(leg.duration || "").trim();
    const missingDuration = mode !== "none" && !duration;
    const details = mode === "none" ? leg.message || "" : duration || "X HRS";
    const label = [data.places[index].name + " to " + data.places[index + 1].name, getModeLabel(mode), missingDuration ? "Duration not provided" : details].filter(Boolean).join(", ");
    const dots = [];
    // A single grid keeps every horizontal run and vertical turn aligned.
    // Label collisions are resolved after measuring the loaded font.
    for (let x = 36; x <= 444; x += 12) {
      if (x < 210 || x >= 270) dots.push(dot(x, y));
    }
    if (index > 0) {
      for (let offset = 72; offset > 0; offset -= 12) dots.push(dot(leftward ? 444 : 36, y - offset));
    }
    return `<li class="inter-city-journey-leg${leftward ? " inter-city-journey-leg--left" : ""}" aria-label="${escapeHtml(label)}">
      <div aria-hidden="true">${dots.join("")}
        <span class="inter-city-journey-icon" style="top:${y - 27}px" data-inter-city-icon data-src="${escapeHtml(assets.modes[mode] || "")}"></span>
        <span class="inter-city-journey-duration" style="top:${y - 24}px;left:${leftward ? 141 : 339}px">${escapeHtml(details)}</span>
      </div>
    </li>`;
  }).join("");
  const stops = data.places.map((place, index) => {
    const words = String(place.name || "").trim().split(/\s+/);
    const name = words.length === 2
      ? words.map(escapeHtml).join("<br>")
      : escapeHtml(place.name);
    return `<p class="inter-city-journey-stop${index % 2 ? " inter-city-journey-stop--right" : ""}" style="top:${52 + Math.max(0, index - 1) * 84}px"><span>${name}</span></p>`;
  }).join("");
  return `<div class="inter-city-journey-frame"><div class="inter-city-journey" style="height:${48 + data.legs.length * 84}px">
    <ol class="inter-city-journey-legs" aria-label="Journey from place to place">${legs}</ol>
    <div aria-hidden="true">${stops}</div>
  </div></div>`;
};

const getEditorial = (data) => {
  if (Array.isArray(data.editorial)) {
    return data.editorial.filter(Boolean);
  }

  return DEFAULT_DATA.editorial;
};

const renderEditorial = (data) => `
  <article class="inter-city-editorial">
    ${getEditorial(data)
      .map(
        (paragraph) =>
          `<p class="inter-city-editorial-copy">${escapeHtml(paragraph)}</p>`,
      )
      .join("")}
  </article>
`;

const hydrateIcons = (root) => {
  root.querySelectorAll("[data-inter-city-icon]").forEach((icon) => {
    const source = icon.dataset.src;
    if (!source) return;

    const image = new Image();
    const markLoaded = () => {
      icon.style.setProperty(
        "--inter-city-icon-image",
        `url("${image.currentSrc || image.src}")`,
      );
    };

    image.addEventListener("load", markLoaded, { once: true });
    image.src = source;
    if (image.complete && image.naturalWidth > 0) markLoaded();
  });
};

const getDurationPlacement = (index, textWidth, labels) => {
  const y = 60 + index * 84;
  const nearby = labels.filter((label) => label.top < y + 22 && label.bottom > y - 36);
  const leftStart = Math.max(36, ...nearby.filter((label) => label.left < 210).map((label) => label.right + 12));
  const rightEnd = Math.min(444, ...nearby.filter((label) => label.right > 270).map((label) => label.left - 12));
  const spaces = [
    { start: leftStart, end: 198, preferred: index % 2 === 1 },
    { start: 282, end: rightEnd, preferred: index % 2 === 0 },
  ].sort((a, b) => (b.end - b.start) - (a.end - a.start) || Number(b.preferred) - Number(a.preferred));
  const space = spaces[0];
  return {
    left: (space.start + space.end) / 2,
    top: y - (space.end - space.start >= textWidth ? 24 : 48),
  };
};

const syncJourneyFrame = (root, frame) => {
  const map = findCountryMap(root);
  const journey = frame?.querySelector(".inter-city-journey");
  if (!journey) return;
  const stops = [...journey.querySelectorAll(".inter-city-journey-stop")];
  const update = () => {
    const availableWidth = frame.parentElement.getBoundingClientRect().width;
    const mapWidth = map?.getBoundingClientRect().width || 720;
    const targetWidth = window.matchMedia("(max-width: 444px)").matches
      ? availableWidth
      : mapWidth * JOURNEY_TO_MAP_WIDTH_RATIO;
    const width = Math.min(targetWidth, availableWidth);
    if (width <= 0) return;
    const scale = width / JOURNEY_WIDTH;
    frame.style.width = `${width}px`;
    frame.style.height = `${journey.offsetHeight * scale}px`;
    journey.style.transform = `scale(${scale})`;
    const labelRects = stops.flatMap((stop) =>
      [...stop.querySelector("span").getClientRects()],
    );
    const origin = journey.getBoundingClientRect();
    const localLabels = labelRects.map((label) => ({
      left: (label.left - origin.left) / scale,
      right: (label.right - origin.left) / scale,
      top: (label.top - origin.top) / scale,
      bottom: (label.bottom - origin.top) / scale,
    }));
    journey.querySelectorAll(".inter-city-journey-duration").forEach((duration, index) => {
      const placement = getDurationPlacement(index, duration.getBoundingClientRect().width / scale, localLabels);
      duration.style.left = `${placement.left}px`;
      duration.style.top = `${placement.top}px`;
    });
    const clearance = 3 * scale;
    journey.querySelectorAll(".inter-city-route-dot").forEach((dot) => {
      const bounds = dot.getBoundingClientRect();
      const overlaps = labelRects.some((label) =>
        bounds.left < label.right + clearance &&
        bounds.right > label.left - clearance &&
        bounds.top < label.bottom + clearance &&
        bounds.bottom > label.top - clearance,
      );
      dot.style.visibility = overlaps ? "hidden" : "visible";
    });
  };
  const cleanup = observeResize(frame, [map, frame.parentElement, ...stops], update);
  document.fonts?.ready.then(() => {
    if (journey.isConnected && root.contains(journey)) update();
  });
  return cleanup;
};

const journeyCleanups = new WeakMap();

const destroyJourneys = (root) => {
  (journeyCleanups.get(root) || []).forEach((cleanup) => cleanup?.());
  journeyCleanups.delete(root);
};

const syncJourney = (root) => {
  const cleanups = [...root.querySelectorAll(".inter-city-journey-frame")]
    .map((frame) => syncJourneyFrame(root, frame));
  journeyCleanups.set(root, cleanups);
};

export const render = (root, data) => {
  validateData(data);
  destroyJourneys(root);
  destroyEditorialCarousel(root.querySelector(".inter-city-editorial"));
  const journeys = getJourneys(data).filter(hasJourney);

  const assets = {
    ...DEFAULT_DATA.assets,
    ...(data.assets || {}),
    modes: {
      ...DEFAULT_DATA.assets.modes,
      ...(data.assets?.modes || {})
    }
  };

  root.innerHTML = `
    <div class="inter-city-inner">
      <h2 class="inter-city-title country-sub-heading" id="inter-city-title">
        ${escapeHtml(data.title || DEFAULT_DATA.title)}
      </h2>

      <div class="inter-city-layout">
        ${renderEditorial(data)}

        ${journeys.length ? `<div class="inter-city-journeys">${journeys.map((journey) => renderJourney(journey, assets)).join("")}</div>` : ""}
      </div>
    </div>
  `;

  root.setAttribute("aria-labelledby", "inter-city-title");
  if (!journeys.length) {
    root.querySelector(".inter-city-journey-frame")?.remove();
    root.querySelector(".inter-city-layout")?.classList.add("country-editorial-only");
    if (!getEditorial(data).length) {
      root.remove();
      return;
    }
  }
  root.removeAttribute("aria-label");
  const editorialLegs = getJourneys(data)
    .flatMap((journey) => journey.legs.map((leg, index) => ({ leg, index, journey })))
    .filter(({ leg }) => Array.isArray(leg.editorial) && leg.editorial.length);
  if (editorialLegs.length) {
    renderEditorialCarousel(root.querySelector(".inter-city-editorial"), [
      { label: "Overview", editorial: getEditorial(data) },
      ...editorialLegs.map(({ leg, index, journey }) => {
        const title = leg.title || `${journey.places[index].name} to ${journey.places[index + 1].name}`;
        return {
          label: title, title,
          editorial: leg.editorial.filter((paragraph) => typeof paragraph === "string" && paragraph.trim()),
        };
      }),
    ], {
      label: "Inter-city travel details", controlLabel: "inter-city travel",
      className: "inter-city-carousel",
    });
  }
  hydrateIcons(root);
  syncJourney(root);
};

const renderError = (root, error) => {
  destroyJourneys(root);
  destroyEditorialCarousel(root.querySelector(".inter-city-editorial"));
  root.innerHTML = `
    <p class="inter-city-error" role="alert">
      The inter-city component could not load. ${escapeHtml(error.message)}
    </p>
  `;
};

export const mount = async (root, source) => {
  if (!(root instanceof Element)) {
    throw new TypeError("InterCityTravel.mount requires a DOM element.");
  }

  try {
    if (!source) {
      throw new Error("Inter-city component needs a data-source attribute.");
    }

    const data = await fetchJson(source, { label: "Inter-city data" });
    render(root, data);
    return root;
  } catch (error) {
    renderError(root, error);
    throw error;
  }
};

export const mountAll = (scope = document) => {
  const roots = scope.querySelectorAll("[data-inter-city-travel]");
  return Promise.all(
    [...roots].map((root) =>
      mount(root, root.dataset.source),
    ),
  );
};
