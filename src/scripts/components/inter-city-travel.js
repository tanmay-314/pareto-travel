(function () {
  "use strict";

  const POSITION_STEP = 14.94;
  const FIRST_POSITION = 5.18;
  const ICON_TO_MAP_SIZE_RATIO = 1 / 12;
  const TICKET_TO_MAP_WIDTH_RATIO = 45 / 72;
  const resizeCleanups = new WeakMap();

  const escapeHtml = (value) =>
    String(value ?? "")
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

    if (data.places.length !== 4 || data.legs.length !== 3) {
      throw new RangeError("This Figma component supports exactly four places and three legs.");
    }
  };

  const positionForIndex = (sequenceIndex) =>
    `${FIRST_POSITION + POSITION_STEP * sequenceIndex}%`;

  const assetImage = ({ src, alt, fallback, className = "inter-city-icon" }) => `
    <img
      class="${className}"
      src="${escapeHtml(src || "")}"
      alt="${escapeHtml(alt)}"
      data-inter-city-asset
    />
    <span class="inter-city-icon-fallback" aria-hidden="true">${escapeHtml(fallback)}</span>
  `;

  const renderStop = (place, placeIndex, assets) => {
    const sequenceIndex = placeIndex * 2;
    const label = `${place.name || ""}\n${place.caption || ""}`.trim();

    return `
      <li
        class="inter-city-stop${placeIndex === 3 ? " inter-city-stop--last" : ""}"
        style="--position: ${positionForIndex(sequenceIndex)}"
        aria-label="${escapeHtml(label.replace("\n", ", "))}"
      >
        <span class="inter-city-icon-shell">
          ${assetImage({
            src: assets.mapPin,
            alt: "",
            fallback: "PIN"
          })}
        </span>
        <span class="inter-city-stop-copy">${escapeHtml(label)}</span>
      </li>
    `;
  };

  const renderLegMarker = (leg, legIndex, assets) => {
    const sequenceIndex = legIndex * 2 + 1;
    const mode = normalizeMode(leg.mode);
    const summary = `${mode} · ${leg.duration || ""}`.toUpperCase();

    return `
      <li
        class="inter-city-leg"
        style="--position: ${positionForIndex(sequenceIndex)}"
        aria-label="${escapeHtml(summary)}"
      >
        <span class="inter-city-leg-summary">${escapeHtml(summary)}</span>
        <span class="inter-city-icon-shell">
          ${assetImage({
            src: assets.modes?.[mode],
            alt: `${mode} icon`,
            fallback: mode.slice(0, 5).toUpperCase()
          })}
        </span>
      </li>
    `;
  };

  const renderJourney = (data) => {
    const sequence = [];

    data.places.forEach((place, placeIndex) => {
      sequence.push(renderStop(place, placeIndex, data.assets || {}));
      if (data.legs[placeIndex]) {
        sequence.push(renderLegMarker(data.legs[placeIndex], placeIndex, data.assets || {}));
      }
    });

    return sequence.join("");
  };

  const renderTicket = (leg, legIndex, places, assets) => {
    const origin = places[legIndex]?.name || "";
    const destination = places[legIndex + 1]?.name || "";
    const mode = normalizeMode(leg.mode).toUpperCase();
    const legLabel = `LEG ${String(legIndex + 1).padStart(2, "0")}`;

    return `
      <article class="ticket" aria-label="${escapeHtml(`${origin} to ${destination} by ${mode}`)}">
        <img class="ticket-background" src="${escapeHtml(assets.ticket || "")}" alt="" data-inter-city-asset />
        <span class="ticket-border" aria-hidden="true"></span>
        ${
          leg.recommended
            ? '<span class="ticket-recommended">PARETO PICK</span>'
            : ""
        }
        <p class="ticket-leg">${escapeHtml(legLabel)}</p>
        <p class="ticket-origin">${escapeHtml(origin)}</p>
        <span class="ticket-arrow" aria-hidden="true">→</span>
        <p class="ticket-destination">${escapeHtml(destination)}</p>
        <p class="ticket-mode">${escapeHtml(mode)}</p>
        <p class="ticket-duration">${escapeHtml(leg.duration)}</p>
        <span class="ticket-perforation" aria-hidden="true"></span>
        <p class="ticket-note">${escapeHtml(leg.note)}</p>
      </article>
    `;
  };

  const syncIconSizeToCountryMap = (root) => {
    const map = document.querySelector("[data-country-map]");
    resizeCleanups.get(root)?.();

    if (!map) return;

    const updateSize = (mapWidth = map.getBoundingClientRect().width) => {
      if (mapWidth <= 0) return;
      const iconSize = mapWidth * ICON_TO_MAP_SIZE_RATIO;
      const ticketWidth = mapWidth * TICKET_TO_MAP_WIDTH_RATIO;
      root.style.setProperty("--country-section-icon-size", `${iconSize}px`);
      root.style.setProperty(
        "--country-section-icon-half-size",
        `${iconSize / 2}px`,
      );
      root.style.setProperty(
        "--inter-city-ticket-width",
        `${ticketWidth}px`,
      );
    };

    updateSize();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(([entry]) => {
        updateSize(entry.contentRect.width);
      });
      observer.observe(map);
      resizeCleanups.set(root, () => observer.disconnect());
      return;
    }

    const handleResize = () => updateSize();
    window.addEventListener("resize", handleResize);
    resizeCleanups.set(root, () => {
      window.removeEventListener("resize", handleResize);
    });
  };

  const render = (root, data) => {
    validateData(data);

    root.classList.add("inter-city");
    root.innerHTML = `
      <div class="inter-city-inner">
        <header class="inter-city-header">
          <h2 class="inter-city-title">${escapeHtml(data.title || "INTER-CITY TRAVEL")}</h2>
        </header>
        <hr class="inter-city-rule" />
        <div class="inter-city-journey-scroll" tabindex="0" aria-label="Journey route">
          <ol class="inter-city-journey">
            ${renderJourney(data)}
          </ol>
        </div>
        <div class="inter-city-tickets-scroll" tabindex="0" aria-label="Journey leg notes">
          <div class="inter-city-tickets">
            ${data.legs
              .map((leg, index) => renderTicket(leg, index, data.places, data.assets || {}))
              .join("")}
          </div>
        </div>
      </div>
    `;

    root.querySelectorAll("[data-inter-city-asset]").forEach((image) => {
      const markLoaded = () => image.classList.add("is-loaded");
      const markFailed = () => image.classList.add("is-failed");

      image.addEventListener("load", markLoaded, { once: true });
      image.addEventListener("error", markFailed, { once: true });
      if (image.complete && image.naturalWidth > 0) markLoaded();
    });

    syncIconSizeToCountryMap(root);
  };

  const renderError = (root, error) => {
    root.innerHTML = `
      <p class="inter-city-error" role="alert">
        The inter-city component could not load. ${escapeHtml(error.message)}
        Serve this folder through a local web server rather than opening the HTML file directly.
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
