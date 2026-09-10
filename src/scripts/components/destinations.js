import { observeResize } from "../lib/component-utils.js";

const dataUrl = new URL("../../data/components/destinations.json", import.meta.url);
const MOBILE_VIEW_QUERY = "(max-width: 444px)";

export function initializeDestinations(header, closeMenu) {
  const trigger = header.querySelector("[data-destinations-trigger]");
  if (!trigger) return;

  const dialog = document.createElement("dialog");
  dialog.className = "destinations-overlay";
  dialog.setAttribute("aria-label", "Destinations");

  const close = document.createElement("button");
  close.type = "button";
  close.className = "destinations-overlay__close";
  close.setAttribute("aria-label", "Close destinations");
  close.autofocus = true;
  const icon = document.createElement("img");
  icon.src = new URL("../../assets/icons/icon-overlay-close.svg", import.meta.url);
  icon.alt = "";
  icon.width = icon.height = 30;
  close.append(icon);

  const content = document.createElement("div");
  content.className = "destinations-overlay__content";
  dialog.append(close, content);
  document.body.append(dialog);

  // CSS owns the viewport breakpoints; scale the 1440px artwork to the frame.
  const syncFrameSize = () => {
    const width = dialog.clientWidth;
    if (!width) return;
    dialog.style.setProperty("--destinations-scale", width / 1440);
  };
  observeResize(dialog, dialog, syncFrameSize);

  let loaded = false;
  let previousOverflow;
  let returnTarget;

  function openDestinations({ automatic = false } = {}) {
    if (dialog.open) return;
    returnTarget = automatic
      ? null
      : window.matchMedia("(max-width: 900px)").matches
        ? header.querySelector(".nav-toggle")
        : trigger;
    closeMenu();
    previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    trigger.setAttribute("aria-expanded", "true");
    dialog.showModal();
    syncFrameSize();
    dialog.scrollTop = 0;
    loadDestinations();
  }

  async function loadDestinations() {
    if (loaded) return;
    content.textContent = "Loading destinations…";
    content.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(dataUrl);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const regions = document.createDocumentFragment();
      for (const region of data.regions) {
        const section = document.createElement("section");
        section.className = "destinations-overlay__region";
        const heading = document.createElement("h2");
        heading.className = "destinations-overlay__heading country-sub-heading";
        heading.textContent = region.name;
        const grid = document.createElement("div");
        grid.className = "destinations-overlay__grid";
        for (const country of region.countries) {
          const card = document.createElement(country.href ? "a" : "figure");
          card.className = "destination-stamp";
          if (country.href) card.href = country.href;
          const name = document.createElement("span");
          name.className = "destination-stamp__name";
          name.textContent = country.name;
          const art = document.createElement("img");
          art.className = "destination-stamp__art";
          art.src = new URL(country.artwork, dataUrl);
          art.alt = "";
          art.width = 360;
          art.height = 180;
          const caption = document.createElement("span");
          caption.className = "destination-stamp__caption";
          caption.textContent = country.caption;
          card.append(name, art, caption);
          grid.append(card);
        }
        section.append(heading, grid);
        regions.append(section);
      }
      content.replaceChildren(regions);
      loaded = true;
    } catch (error) {
      console.error("Unable to load destinations:", error);
      content.textContent = "Destinations could not be loaded. ";
      const retry = document.createElement("button");
      retry.type = "button";
      retry.textContent = "Try again";
      retry.addEventListener("click", loadDestinations);
      content.append(retry);
    } finally {
      content.removeAttribute("aria-busy");
    }
  }

  const mapContainer = document.querySelector("#map-container");
  const mobileLandingQuery = window.matchMedia(MOBILE_VIEW_QUERY);
  if (mapContainer && mobileLandingQuery.matches) {
    const primary = document.createElement("section");
    primary.className = "destinations-primary";
    primary.id = "destinations-primary";
    primary.setAttribute("aria-label", "Destinations");
    primary.append(content);
    mapContainer.style.padding = "0";
    mapContainer.replaceChildren(primary);
    dialog.remove();
    trigger.removeAttribute("aria-haspopup");
    trigger.removeAttribute("aria-expanded");
    trigger.setAttribute("aria-controls", primary.id);
    trigger.addEventListener("click", () => {
      closeMenu();
      primary.scrollIntoView({ block: "start" });
    });
    observeResize(dialog, primary, () => {
      const width = primary.clientWidth;
      if (width) primary.style.setProperty("--destinations-scale", width / 1440);
    });
    loadDestinations();
    return;
  }

  trigger.addEventListener("click", () => openDestinations());
  const closeDestinations = () => {
    dialog.close();
    document.documentElement.style.overflow = previousOverflow;
    trigger.setAttribute("aria-expanded", "false");
    returnTarget?.focus({ preventScroll: true });
  };
  close.addEventListener("click", closeDestinations);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeDestinations();
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const controls = [...dialog.querySelectorAll("button, a[href]")];
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

}
