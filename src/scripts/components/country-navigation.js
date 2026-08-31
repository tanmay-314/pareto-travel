const DEFAULT_CONFIG_URL = "./data/components/country-navigation.json";
const COUNTRY_MAP_FIGMA_WIDTH = 720;
const DRAWER_TO_MAP_WIDTH_RATIO = 5 / 12;
const DRAWER_OPEN_TO_MAP_WIDTH_RATIO = 7 / 80;
const navigationBehaviorCleanups = new WeakMap();
const navigationDrawerCleanups = new WeakMap();
const navigationResizeCleanups = new WeakMap();

function createBoard(board, assets) {
  const link = document.createElement("a");
  const signSource = assets[board.asset];

  if (!signSource) {
    throw new Error(`Country navigation asset "${board.asset}" was not found.`);
  }

  link.className = "country-navigation-board";
  link.href = board.target;
  link.dataset.label = board.label;
  link.style.left = `${board.x}px`;
  link.style.top = `${board.y}px`;
  link.style.width = `${board.width}px`;
  link.style.height = `${board.height}px`;
  link.style.setProperty("--board-rotation", `${board.rotation ?? 0}deg`);
  link.style.setProperty("--board-scale-x", board.flipX ? -1 : 1);
  link.setAttribute("aria-label", `Jump to ${board.label}`);

  const sign = document.createElement("span");
  sign.className = "country-navigation-sign";
  sign.style.setProperty("--country-nav-sign-image", `url("${signSource}")`);
  sign.setAttribute("aria-hidden", "true");
  link.append(sign);

  return link;
}

function setCurrentBoard(navigation, currentLink) {
  navigation
    .querySelectorAll(".country-navigation-board[aria-current]")
    .forEach((board) => board.removeAttribute("aria-current"));
  currentLink?.setAttribute("aria-current", "location");
}

function addNavigationBehavior(navigation) {
  navigationBehaviorCleanups.get(navigation)?.();

  const links = [...navigation.querySelectorAll(".country-navigation-board")];
  const sections = links
    .map((link) => ({ link, section: document.querySelector(link.hash) }))
    .filter(({ section }) => section);

  const handleClick = (event) => {
    const link = event.target.closest(".country-navigation-board");
    if (!link || !navigation.contains(link)) return;

    const target = document.querySelector(link.hash);
    if (!target) return;

    event.preventDefault();
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
      block: "start"
    });
    history.replaceState(null, "", link.hash);
    setCurrentBoard(navigation, link);

    navigation.dispatchEvent(
      new CustomEvent("country-navigation:select", {
        bubbles: true,
        detail: { target: link.hash, label: link.dataset.label }
      })
    );
  };

  let frame = 0;
  const updateCurrentSection = () => {
    frame = 0;
    const activationLine = window.innerHeight * 0.35;
    let current = null;
    let currentTop = -Infinity;

    sections.forEach((entry) => {
      const sectionTop = entry.section.getBoundingClientRect().top;
      if (sectionTop <= activationLine && sectionTop > currentTop) {
        current = entry.link;
        currentTop = sectionTop;
      }
    });

    setCurrentBoard(navigation, current);
  };

  const scheduleCurrentSectionUpdate = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(updateCurrentSection);
  };

  navigation.addEventListener("click", handleClick);
  window.addEventListener("scroll", scheduleCurrentSectionUpdate, {
    passive: true
  });
  window.addEventListener("resize", scheduleCurrentSectionUpdate);
  updateCurrentSection();

  navigationBehaviorCleanups.set(navigation, () => {
    navigation.removeEventListener("click", handleClick);
    window.removeEventListener("scroll", scheduleCurrentSectionUpdate);
    window.removeEventListener("resize", scheduleCurrentSectionUpdate);
    if (frame) window.cancelAnimationFrame(frame);
  });
}

function addDrawerBehavior(navigation) {
  const drawer = navigation.closest("[data-country-navigation-drawer]");
  if (!drawer) return;

  navigationDrawerCleanups.get(drawer)?.();

  const trigger = drawer.querySelector(".country-navigation-trigger");
  const panel = drawer.querySelector(".country-navigation-panel");
  const closeButton = drawer.querySelector(".country-navigation-close");
  if (!trigger || !panel || !closeButton) return;

  const setOpen = (isOpen, returnFocus = false) => {
    drawer.dataset.state = isOpen ? "open" : "closed";
    trigger.setAttribute("aria-expanded", String(isOpen));
    panel.setAttribute("aria-hidden", String(!isOpen));
    panel.inert = !isOpen;

    if (isOpen) {
      window.requestAnimationFrame(() => {
        if (drawer.dataset.state === "open") {
          closeButton.focus({ preventScroll: true });
        }
      });
    } else if (returnFocus) {
      window.requestAnimationFrame(() => {
        if (drawer.dataset.state === "closed") {
          trigger.focus({ preventScroll: true });
        }
      });
    }
  };

  const handleTriggerClick = () => setOpen(true);
  const handleCloseClick = () => setOpen(false, true);
  const handleKeydown = (event) => {
    if (event.key !== "Escape" || drawer.dataset.state !== "open") return;
    event.preventDefault();
    setOpen(false, true);
  };
  const handleNavigationSelect = () => {
    const focusIsInsidePanel = panel.contains(document.activeElement);
    setOpen(false, focusIsInsidePanel);
  };

  trigger.addEventListener("click", handleTriggerClick);
  closeButton.addEventListener("click", handleCloseClick);
  document.addEventListener("keydown", handleKeydown);
  navigation.addEventListener(
    "country-navigation:select",
    handleNavigationSelect
  );

  navigationDrawerCleanups.set(drawer, () => {
    trigger.removeEventListener("click", handleTriggerClick);
    closeButton.removeEventListener("click", handleCloseClick);
    document.removeEventListener("keydown", handleKeydown);
    navigation.removeEventListener(
      "country-navigation:select",
      handleNavigationSelect
    );
  });
}

function syncDrawerToCountryMap(navigation) {
  const drawer = navigation.closest("[data-country-navigation-drawer]");
  const map = navigation
    .closest(".country-page")
    ?.querySelector("[data-country-map]");
  if (!drawer) return;

  navigationResizeCleanups.get(drawer)?.();

  const updateSize = (
    mapWidth = map?.getBoundingClientRect().width || COUNTRY_MAP_FIGMA_WIDTH
  ) => {
    if (mapWidth <= 0) return;

    const scale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
    const drawerWidth = mapWidth * DRAWER_TO_MAP_WIDTH_RATIO;
    const drawerOpenWidth = mapWidth * DRAWER_OPEN_TO_MAP_WIDTH_RATIO;

    drawer.style.setProperty("--country-drawer-scale", scale);
    drawer.style.setProperty("--country-drawer-width", `${drawerWidth}px`);
    drawer.style.setProperty(
      "--country-drawer-open-width",
      `${drawerOpenWidth}px`
    );
    drawer.style.setProperty(
      "--country-drawer-open-height",
      `${30 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-trigger-top",
      `${256 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-panel-top",
      `${-8 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-overscan",
      `${8 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-background-left",
      `${scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-background-width",
      `${299 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-shadow-extension",
      `${4 * scale}px`
    );
    drawer.style.setProperty(
      "--country-drawer-slide-gutter",
      `${8 * scale}px`
    );
  };

  updateSize();

  if (!map) return;

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width);
    });
    observer.observe(map);
    navigationResizeCleanups.set(drawer, () => observer.disconnect());
    return;
  }

  const handleResize = () => updateSize();
  window.addEventListener("resize", handleResize);
  navigationResizeCleanups.set(drawer, () => {
    window.removeEventListener("resize", handleResize);
  });
}

async function renderCountryNavigation(navigation) {
  const configUrl = navigation.dataset.config || DEFAULT_CONFIG_URL;
  addDrawerBehavior(navigation);
  syncDrawerToCountryMap(navigation);

  try {
    const response = await fetch(configUrl);
    if (!response.ok) throw new Error(`Could not load ${configUrl}`);

    const config = await response.json();
    const configBaseUrl = new URL(".", response.url);
    const assets = Object.fromEntries(
      Object.entries(config.assets).map(([name, path]) => [
        name,
        new URL(path, configBaseUrl).href
      ])
    );
    navigation.replaceChildren();

    const surface = document.createElement("div");
    surface.className = "country-navigation-surface";
    surface.style.width = `${config.width}px`;
    surface.style.height = `${config.height}px`;

    const pole = document.createElement("span");
    pole.className = "country-navigation-pole";
    pole.style.setProperty(
      "--country-nav-pole-image",
      `url("${assets.pole}")`
    );
    pole.setAttribute("aria-hidden", "true");
    surface.append(pole);

    config.boards.forEach((board) => {
      surface.append(createBoard(board, assets));
    });

    navigation.append(surface);
    addNavigationBehavior(navigation);
    navigation.dataset.status = "ready";
  } catch (error) {
    console.error(error);
    navigation.dataset.status = "error";
  }
}

document
  .querySelectorAll("[data-country-navigation]")
  .forEach(renderCountryNavigation);

export { renderCountryNavigation };
