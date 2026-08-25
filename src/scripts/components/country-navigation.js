const DEFAULT_CONFIG_URL = "./data/components/country-navigation.json";
const COUNTRY_MAP_FIGMA_WIDTH = 720;
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
  currentLink.setAttribute("aria-current", "location");
}

function addNavigationBehavior(navigation) {
  navigation.addEventListener("click", (event) => {
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
  });
}

function syncToCountryMap(navigation, surface, config) {
  const map = document.querySelector("[data-country-map]");
  navigationResizeCleanups.get(navigation)?.();

  const updateScale = (mapWidth = map?.getBoundingClientRect().width) => {
    if (!mapWidth || mapWidth <= 0) return;
    const scale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;

    navigation.style.width = `${config.width * scale}px`;
    navigation.style.height = `${config.height * scale}px`;
    surface.style.setProperty("--country-navigation-scale", scale);
  };

  if (!map) {
    navigation.style.width = `${config.width}px`;
    navigation.style.height = `${config.height}px`;
    return;
  }

  updateScale();

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(([entry]) => {
      updateScale(entry.contentRect.width);
    });
    observer.observe(map);
    navigationResizeCleanups.set(navigation, () => observer.disconnect());
    return;
  }

  const handleResize = () => updateScale();
  window.addEventListener("resize", handleResize);
  navigationResizeCleanups.set(navigation, () => {
    window.removeEventListener("resize", handleResize);
  });
}

async function renderCountryNavigation(navigation) {
  const configUrl = navigation.dataset.config || DEFAULT_CONFIG_URL;

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

    const pole = document.createElement("img");
    pole.className = "country-navigation-pole";
    pole.src = assets.pole;
    pole.alt = "";
    pole.width = 18;
    pole.height = config.height;
    pole.draggable = false;
    surface.append(pole);

    config.boards.forEach((board) => {
      surface.append(createBoard(board, assets));
    });

    navigation.append(surface);
    syncToCountryMap(navigation, surface, config);
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
