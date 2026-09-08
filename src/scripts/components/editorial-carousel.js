import { findCountryMap, observeResize } from "../lib/component-utils.js";

const resizeCleanups = new WeakMap();

export function destroyEditorialCarousel(root) {
  resizeCleanups.get(root)?.();
  resizeCleanups.delete(root);
}

function createText(className, text) {
  const node = document.createElement("p");
  node.className = className;
  node.textContent = text;
  return node;
}

export function renderEditorialCarousel(root, screens, {
  label = "Editorial details", controlLabel = "editorial",
  className = "", onSelect,
} = {}) {
  if (!screens.length) throw new Error("Editorial carousel needs at least one screen.");
  destroyEditorialCarousel(root);
  const classes = (part = "") => {
    const suffix = part ? `-${part}` : "";
    return `editorial-carousel${suffix}${className ? ` ${className}${suffix}` : ""}`;
  };
  const carousel = document.createElement("div");
  carousel.className = classes();
  carousel.setAttribute("role", "region");
  carousel.setAttribute("aria-roledescription", "carousel");
  carousel.setAttribute("aria-label", label);
  const viewport = document.createElement("div");
  viewport.className = classes("viewport");
  const slides = screens.map((screen, index) => {
    const slide = document.createElement("section");
    slide.className = classes("slide");
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.setAttribute("aria-label", `${index + 1} of ${screens.length}: ${screen.label}`);
    if (screen.title) {
      const heading = document.createElement("h3");
      heading.className = classes("title");
      heading.textContent = screen.title;
      slide.append(heading);
    }
    (screen.editorial || []).forEach((text, paragraphIndex) => {
      const paragraph = createText("editorial-carousel-copy", text);
      if (screen.headings?.includes(paragraphIndex)) {
        const heading = document.createElement("h3");
        heading.className = classes("subheading");
        heading.textContent = text;
        slide.append(heading);
      } else {
        slide.append(paragraph);
      }
    });
    viewport.append(slide);
    return slide;
  });
  const arrow = (direction, label) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `${classes("arrow")} ${classes(direction)}`;
    button.setAttribute("aria-label", label);
    const icon = document.createElement("img");
    icon.src = new URL(`../../assets/icons/icon-carousel-${direction}.svg`, import.meta.url).href;
    icon.alt = "";
    icon.width = 30;
    icon.height = 30;
    button.append(icon);
    const hover = icon.cloneNode();
    hover.className = classes("arrow-hover");
    hover.src = new URL(`../../assets/icons/icon-carousel-${direction}-hover.svg`, import.meta.url).href;
    button.append(hover);
    return button;
  };
  const back = arrow("back", `Previous ${controlLabel} screen`);
  const forward = arrow("fwd", `Next ${controlLabel} screen`);
  const pagination = document.createElement("div");
  pagination.className = classes("pagination");
  pagination.setAttribute("aria-hidden", "true");
  const dots = screens.map(() => {
    const dot = document.createElement("img");
    dot.alt = "";
    dot.width = 8;
    dot.height = 12;
    pagination.append(dot);
    return dot;
  });
  const status = createText("visually-hidden", "");
  status.setAttribute("aria-live", "polite");
  status.setAttribute("aria-atomic", "true");
  let activeIndex = 0;
  const select = (index, notify = true) => {
    activeIndex = Math.max(0, Math.min(index, slides.length - 1));
    slides.forEach((slide, i) => {
      const active = i === activeIndex;
      slide.inert = !active;
      slide.setAttribute("aria-hidden", String(!active));
      slide.classList.toggle("is-active", active);
      dots[i].src = new URL(`../../assets/icons/icon-carousel-state-${active ? "active" : "inactive"}.svg`, import.meta.url).href;
    });
    // Move focus before hiding an arrow at either end of the carousel.
    if (activeIndex === 0 && document.activeElement === back) {
      forward.disabled = false;
      forward.focus();
    }
    if (activeIndex === slides.length - 1 && document.activeElement === forward) {
      back.disabled = false;
      back.focus();
    }
    back.disabled = activeIndex === 0;
    forward.disabled = activeIndex === slides.length - 1;
    status.textContent = `${screens[activeIndex].label}, screen ${activeIndex + 1} of ${slides.length}`;
    if (notify) onSelect?.(activeIndex);
  };
  back.addEventListener("click", () => select(activeIndex - 1));
  forward.addEventListener("click", () => select(activeIndex + 1));
  carousel.addEventListener("keydown", (event) => {
    const destinations = { ArrowLeft: activeIndex - 1, ArrowRight: activeIndex + 1, Home: 0, End: slides.length - 1 };
    if (!(event.key in destinations)) return;
    event.preventDefault();
    select(destinations[event.key]);
  });
  let touchStart = null;
  viewport.addEventListener("touchstart", (event) => {
    touchStart = event.touches.length === 1 ? event.touches[0] : null;
  }, { passive: true });
  viewport.addEventListener("touchend", (event) => {
    if (!touchStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - touchStart.clientX;
    const dy = event.changedTouches[0].clientY - touchStart.clientY;
    touchStart = null;
    if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) select(activeIndex + (dx < 0 ? 1 : -1));
  }, { passive: true });
  viewport.addEventListener("touchcancel", () => { touchStart = null; }, { passive: true });
  carousel.append(back, viewport, forward, pagination, status);
  root.replaceChildren(carousel);
  root.hidden = false;
  const map = findCountryMap(root);
  if (map) {
    resizeCleanups.set(root, observeResize(root, map, () => {
      const mapWidth = map.getBoundingClientRect().width;
      if (mapWidth > 0) {
        carousel.style.setProperty("--editorial-controls-scale", mapWidth / 720);
      }
    }));
  }
  select(0, false);
  return { select };
}
