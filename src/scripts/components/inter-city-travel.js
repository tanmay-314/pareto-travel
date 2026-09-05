import { fetchJson, findCountryMap, observeResize } from "../lib/component-utils.js";

const DEFAULT_DATA = {
  title: "GOING FROM PLACE TO PLACE",
  editorial: [],
  assets: {
    ticket: "../assets/components/inter-city-travel/ticket.svg",
    modes: {
      flight: "../assets/icons/icon-flight.svg",
      bus: "../assets/icons/icon-bus.svg",
      train: "../assets/icons/icon-train.svg",
      car: "../assets/icons/icon-car.svg"
    }
  }
};

const COUNTRY_MAP_FIGMA_WIDTH = 720;
const TICKET_TO_MAP_WIDTH_RATIO = 5 / 8;
const TICKET_FIGMA_WIDTH =
  COUNTRY_MAP_FIGMA_WIDTH * TICKET_TO_MAP_WIDTH_RATIO;
const TICKET_STACK_FIGMA_WIDTH = 558;
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

export const validateData = (data) => {
  if (!data || typeof data !== "object") {
    throw new TypeError("Inter-city data must be an object.");
  }

  if (!Array.isArray(data.places) || !Array.isArray(data.legs)) {
    throw new TypeError("Inter-city data requires places and legs arrays.");
  }

  if (data.places.length !== data.legs.length + 1) {
    throw new RangeError("The number of places must be exactly one more than the number of legs.");
  }

  if (data.legs.length === 0) {
    throw new RangeError("Inter-city data requires at least one journey leg.");
  }
};

const renderTicket = (leg, legIndex, places, assets) => {
  const origin = places[legIndex]?.name || "";
  const destination = places[legIndex + 1]?.name || "";
  const mode = normalizeMode(leg.mode);
  const modeLabel = getModeLabel(leg.mode);
  const icon = assets.modes?.[mode] || "";
  const transportDetails = [modeLabel, leg.duration].filter(Boolean).join(" · ");
  const accessibleLabel = [
    `${origin} to ${destination}`,
    modeLabel ? `by ${modeLabel}` : "",
    leg.duration || "",
  ]
    .filter(Boolean)
    .join(", ");

  return `
    <article class="inter-city-ticket" aria-label="${escapeHtml(accessibleLabel)}">
      <img
        class="inter-city-ticket-background"
        src="${escapeHtml(assets.ticket || DEFAULT_DATA.assets.ticket)}"
        alt=""
        width="452"
        height="184"
        aria-hidden="true"
      >

      ${leg.recommended ? '<span class="inter-city-ticket-recommended">Pareto Pick</span>' : ""}
      <div class="inter-city-ticket-route-row">
        <p class="inter-city-ticket-origin">${escapeHtml(origin)}</p>
        <span class="inter-city-ticket-icon-shell" aria-hidden="true">
          <span
            class="inter-city-ticket-icon"
            data-inter-city-icon
            data-src="${escapeHtml(icon)}"
          ></span>
        </span>
        <p class="inter-city-ticket-destination">${escapeHtml(destination)}</p>
      </div>
      <span class="inter-city-ticket-rule" aria-hidden="true"></span>
      <p class="inter-city-ticket-transport-details">${escapeHtml(transportDetails)}</p>
    </article>
  `;
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

const syncTicketStack = (root) => {
  const map = findCountryMap(root);
  const frame = root.querySelector(".inter-city-ticket-stack-frame");
  const stack = frame?.querySelector(".inter-city-ticket-stack");

  if (!frame || !stack) return;

  observeResize(root, map, () => {
    const mapWidth =
      map?.getBoundingClientRect().width || COUNTRY_MAP_FIGMA_WIDTH;
    if (mapWidth <= 0) return;

    const ticketWidth = mapWidth * TICKET_TO_MAP_WIDTH_RATIO;
    const scale = ticketWidth / TICKET_FIGMA_WIDTH;
    const stackWidth = TICKET_STACK_FIGMA_WIDTH * scale;
    root.style.setProperty(
      "--inter-city-ticket-stack-width",
      `${stackWidth}px`,
    );
    frame.style.width = `${stackWidth}px`;
    frame.style.height = `${stack.offsetHeight * scale}px`;
    stack.style.setProperty("--inter-city-ticket-stack-scale", scale);
  });
};

export const render = (root, data) => {
  validateData(data);

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

        <div class="inter-city-ticket-stack-frame">
          <div class="inter-city-ticket-stack" aria-label="Journey tickets">
            ${data.legs
              .map((leg, index) => renderTicket(leg, index, data.places, assets))
              .join("")}
          </div>
        </div>
      </div>
    </div>
  `;

  root.setAttribute("aria-labelledby", "inter-city-title");
  root.removeAttribute("aria-label");
  hydrateIcons(root);
  syncTicketStack(root);
};

const renderError = (root, error) => {
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
