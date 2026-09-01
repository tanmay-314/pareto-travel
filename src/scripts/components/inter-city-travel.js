(() => {
  "use strict";

  const DEFAULT_DATA = {
    title: "GOING FROM PLACE TO PLACE",
    editorial: [
      "Cambodian cuisine, or Khmer cuisine, is subtle, aromatic, and deeply shaped by the country’s rivers, fertile plains, and tropical climate.",
      "Rice and freshwater fish form the backbone of everyday meals, accompanied by fragrant herbs, vegetables, fermented ingredients, and sauces that balance salty, sour, sweet, and occasionally bitter flavours."
    ],
    assets: {
      ticket: "../assets/components/inter-city-travel/ticket.svg",
      modes: {
        airplane: "../assets/icons/icon-airplane.svg",
        bus: "../assets/icons/icon-bus.svg",
        train: "../assets/icons/icon-train.svg",
        car: "../assets/icons/icon-car.svg"
      }
    },
    places: [
      { name: "SIEM REAP" },
      { name: "PHNOM PENH" },
      { name: "BATTAMBANG" },
      { name: "KAMPOT" }
    ],
    legs: [
      {
        mode: "bus",
        duration: "6 HRS",
        note: "Take a daytime service. You trade romance for frequency, directness and a city-centre arrival."
      },
      {
        mode: "train",
        duration: "5 HRS",
        note: "The slower leg becomes part of the trip. Check the operating day before building the itinerary around it."
      },
      {
        mode: "car",
        duration: "4 HRS",
        note: "An awkward cross-country connection. A private transfer saves the backtrack and works well when shared."
      }
    ]
  };

  const TICKET_STACK_WIDTH = 558;
  const TICKET_STACK_HEIGHT = 588;
  const resizeCleanups = new WeakMap();

  const escapeHtml = (value = "") =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalizeMode = (mode) => {
    const value = String(mode || "").trim().toLowerCase();
    return value === "plane" || value === "air" ? "airplane" : value;
  };

  const validateData = (data) => {
    if (!data || typeof data !== "object") {
      throw new TypeError("Inter-city data must be an object.");
    }

    if (!Array.isArray(data.places) || !Array.isArray(data.legs)) {
      throw new TypeError("Inter-city data requires places and legs arrays.");
    }

    if (data.places.length !== data.legs.length + 1) {
      throw new RangeError("The number of places must be exactly one more than the number of legs.");
    }

    if (data.legs.length !== 3) {
      throw new RangeError("This Figma composition supports exactly three journey tickets.");
    }
  };

  const renderTicket = (leg, legIndex, places, assets) => {
    const origin = places[legIndex]?.name || "";
    const destination = places[legIndex + 1]?.name || "";
    const mode = normalizeMode(leg.mode);
    const icon = assets.modes?.[mode] || "";

    return `
      <article class="inter-city-ticket" aria-label="${escapeHtml(`${origin} to ${destination} by ${mode}`)}">
        <img
          class="inter-city-ticket-background"
          src="${escapeHtml(assets.ticket || DEFAULT_DATA.assets.ticket)}"
          alt=""
          width="452"
          height="184"
          aria-hidden="true"
        >

        <span class="inter-city-ticket-route" aria-hidden="true"></span>
        <p class="inter-city-ticket-origin">${escapeHtml(origin)}</p>
        <p class="inter-city-ticket-destination">${escapeHtml(destination)}</p>

        <span class="inter-city-ticket-icon-shell" aria-hidden="true">
          <span
            class="inter-city-ticket-icon"
            data-inter-city-icon
            data-src="${escapeHtml(icon)}"
          ></span>
        </span>

        <p class="inter-city-ticket-mode">${escapeHtml(mode)}</p>
        <p class="inter-city-ticket-duration">${escapeHtml(leg.duration || "")}</p>
        <span class="inter-city-ticket-rule" aria-hidden="true"></span>
        <p class="inter-city-ticket-note">${escapeHtml(leg.note || "")}</p>
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
        icon.classList.add("is-loaded");
      };

      image.addEventListener("load", markLoaded, { once: true });
      image.src = source;
      if (image.complete && image.naturalWidth > 0) markLoaded();
    });
  };

  const syncTicketStack = (root) => {
    const frame = root.querySelector(".inter-city-ticket-stack-frame");
    const stack = frame?.querySelector(".inter-city-ticket-stack");
    resizeCleanups.get(root)?.();

    if (!frame || !stack) return;

    const updateSize = () => {
      const availableWidth = frame.getBoundingClientRect().width;
      if (availableWidth <= 0) return;

      const scale = Math.min(1, availableWidth / TICKET_STACK_WIDTH);
      frame.style.height = `${TICKET_STACK_HEIGHT * scale}px`;
      stack.style.setProperty("--inter-city-ticket-stack-scale", scale);
    };

    updateSize();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(updateSize);
      observer.observe(frame);
      resizeCleanups.set(root, () => observer.disconnect());
      return;
    }

    window.addEventListener("resize", updateSize);
    resizeCleanups.set(root, () => window.removeEventListener("resize", updateSize));
  };

  const render = (root, data) => {
    validateData(data);

    const assets = {
      ...DEFAULT_DATA.assets,
      ...(data.assets || {}),
      modes: {
        ...DEFAULT_DATA.assets.modes,
        ...(data.assets?.modes || {})
      }
    };

    root.classList.add("inter-city");
    root.innerHTML = `
      <div class="inter-city-inner">
        <h2 class="inter-city-title" id="inter-city-title">
          ${escapeHtml(data.title || DEFAULT_DATA.title)}
        </h2>

        <div class="inter-city-layout">
          <div class="inter-city-ticket-stack-frame">
            <div class="inter-city-ticket-stack" aria-label="Journey leg notes">
              ${data.legs
                .map((leg, index) => renderTicket(leg, index, data.places, assets))
                .join("")}
            </div>
          </div>

          ${renderEditorial(data)}
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

  const mount = async (root, source) => {
    if (!(root instanceof Element)) {
      throw new TypeError("InterCityTravel.mount requires a DOM element.");
    }

    try {
      const response = await fetch(source);
      if (!response.ok) throw new Error(`Data request failed with status ${response.status}.`);
      const data = await response.json();
      render(root, data);
      return root;
    } catch (error) {
      renderError(root, error);
      throw error;
    }
  };

  const mountAll = () => {
    document.querySelectorAll("[data-inter-city-travel]").forEach((root) => {
      const source = root.dataset.source || "../data/countries/cambodia/inter-city-travel.json";
      mount(root, source).catch((error) => console.error(error));
    });
  };

  window.InterCityTravel = Object.freeze({ mount, render, validateData });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll, { once: true });
  } else {
    mountAll();
  }
})();
