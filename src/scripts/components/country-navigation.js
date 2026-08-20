const DEFAULT_CONFIG_URL = "./data/components/country-navigation.json";

function createImage(className, source) {
  const image = document.createElement("img");
  image.className = className;
  image.src = source;
  image.alt = "";
  image.width = 240;
  image.height = 60;
  image.draggable = false;
  return image;
}

function createBoard(board, assets) {
  const link = document.createElement("a");
  const direction = board.direction?.toLowerCase() === "left" ? "left" : "right";

  link.className = "country-navigation-board";
  link.href = board.target;
  link.dataset.direction = direction;
  link.style.left = `${board.x}px`;
  link.style.top = `${board.y}px`;
  link.style.setProperty("--board-rotation", `${board.rotation ?? 0}deg`);
  link.setAttribute("aria-label", `Jump to ${board.label}`);

  const content = document.createElement("span");
  content.className = "country-navigation-board-content";
  content.append(
    createImage(
      "country-navigation-sign country-navigation-sign--default",
      assets.signDefault
    ),
    createImage(
      "country-navigation-sign country-navigation-sign--hover",
      assets.signHover
    )
  );

  const label = document.createElement("span");
  label.className = "country-navigation-label";
  label.textContent = board.label;
  content.append(label);
  link.append(content);

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
        detail: { target: link.hash, label: link.textContent.trim() }
      })
    );
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
    navigation.style.width = `${config.width}px`;
    navigation.style.height = `${config.height}px`;

    const pole = document.createElement("img");
    pole.className = "country-navigation-pole";
    pole.src = assets.pole;
    pole.alt = "";
    pole.width = 18;
    pole.height = config.height;
    pole.draggable = false;
    navigation.append(pole);

    config.boards.forEach((board) => {
      navigation.append(createBoard(board, assets));
    });

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