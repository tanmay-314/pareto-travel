import { fetchJson, findCountryMap, observeResize } from "../lib/component-utils.js";

const COUNTRY_MAP_FIGMA_WIDTH = 720;
const MENU_FIGMA_WIDTH = 420;
const MENU_FIGMA_HEIGHT = 540;
const DEFAULT_DATA = {
  title: "MEALS YOU CAN'T MISS",
  chapters: [],
  editorial: []
};

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderChapter(chapter) {
  return `
    <article class="cuisine-chapter">
      <div class="cuisine-chapter-label">
        <img
          class="cuisine-icon"
          src="${escapeHtml(chapter.icon)}"
          alt=""
          width="60"
          height="60"
          aria-hidden="true"
        >
        <p class="cuisine-period">${escapeHtml(chapter.period)}</p>
      </div>

      <div class="cuisine-chapter-copy">
        <h3 class="cuisine-item-title">${escapeHtml(chapter.dish)}</h3>
        <p class="cuisine-description">${escapeHtml(chapter.description)}</p>
      </div>
    </article>
  `;
}

function getEditorial(data) {
  if (Array.isArray(data.editorial)) {
    return data.editorial.filter(Boolean);
  }

  return [data.lede, data.paretoPick?.copy].filter(Boolean);
}

function renderEditorial(data) {
  const paragraphs = getEditorial(data);
  const link = data.detailLink;
  const hasLink = Boolean(link?.label && link?.href);

  return `
    <article class="cuisine-editorial"${paragraphs.length || hasLink ? "" : " hidden"}>
      ${paragraphs
        .map(
          (paragraph) =>
            `<p class="cuisine-editorial-copy">${escapeHtml(paragraph)}</p>`,
        )
        .join("")}
      ${
        hasLink
          ? `<a class="cuisine-editorial-link" href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a>`
          : ""
      }
    </article>
  `;
}

function syncMenuToCountryMap(root) {
  const map = findCountryMap(root);
  const frame = root.querySelector(".cuisine-menu-frame");
  const menu = frame?.querySelector(".cuisine-menu");

  if (!frame || !menu) return;

  observeResize(root, map, () => {
    const mapWidth =
      map?.getBoundingClientRect().width || COUNTRY_MAP_FIGMA_WIDTH;
    if (mapWidth <= 0) return;
    const scale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
    const scaledWidth = MENU_FIGMA_WIDTH * scale;
    const scaledHeight = MENU_FIGMA_HEIGHT * scale;

    frame.style.width = `${scaledWidth}px`;
    frame.style.height = `${scaledHeight}px`;
    menu.style.setProperty("--cuisine-menu-scale", scale);
  });
}

export function renderCuisine(root, data) {
  const chapters = Array.isArray(data.chapters)
    ? data.chapters.slice(0, 3)
    : DEFAULT_DATA.chapters;

  root.innerHTML = `
    <h2 class="cuisine-title country-sub-heading" id="cuisine-title">
      ${escapeHtml(data.title || "MEALS YOU CAN'T MISS")}
    </h2>

    <div class="cuisine-layout">
      <div class="cuisine-menu-frame">
        <div class="cuisine-menu">
          <span class="cuisine-menu-paper" aria-hidden="true"></span>
          <div class="cuisine-chapters">
            ${chapters.map(renderChapter).join("")}
          </div>
        </div>
      </div>

      ${renderEditorial(data)}
    </div>
  `;

  syncMenuToCountryMap(root);
}

async function loadData(root) {
  const source = root.dataset.source;

  if (!source) {
    throw new Error("Cuisine component needs a data-source attribute.");
  }

  return fetchJson(source, { label: "Cuisine data" });
}

export async function initCuisine(root) {
  try {
    const data = await loadData(root);
    renderCuisine(root, data);
  } catch (error) {
    const message = document.createElement("p");
    message.className = "cuisine-error";
    message.setAttribute("role", "alert");
    message.textContent = "The cuisine section could not be loaded.";
    root.replaceChildren(message);
    throw error;
  }
}

export function loadCuisines(scope = document) {
  return Promise.all(
    [...scope.querySelectorAll("[data-cuisine-component]")].map(initCuisine),
  );
}
