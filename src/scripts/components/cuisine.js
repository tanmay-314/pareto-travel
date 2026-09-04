(() => {
  "use strict";

  const COUNTRY_MAP_FIGMA_WIDTH = 720;
  const MENU_FIGMA_WIDTH = 420;
  const MENU_FIGMA_HEIGHT = 540;
  const resizeCleanups = new WeakMap();

  const DEFAULT_DATA = {
    title: "MEALS YOU CAN'T MISS",
    chapters: [
      {
        period: "BREAKFAST",
        icon: "../assets/components/cuisine/icon-morning.svg",
        dish: "Nom banh chok",
        description:
          "Cool rice noodles, green fish curry and a fistful of herbs — Cambodia’s most quietly perfect breakfast."
      },
      {
        period: "LUNCH",
        icon: "../assets/components/cuisine/icon-afternoon.svg",
        dish: "Fish amok",
        description:
          "Freshwater fish steamed with coconut custard and kroeung. Subtle, aromatic, and much better than its reputation."
      },
      {
        period: "DINNER",
        icon: "../assets/components/cuisine/icon-night.svg",
        dish: "Beef lok lak",
        description:
          "Peppery seared beef, crisp vegetables and a sharp lime dip: the easy crowd-pleaser after a temple-heavy day."
      }
    ],
    editorial: [
      "The food is… something. Flavours are extremely pungent—popular dishes such as prahok ktis and fish amok both lean heavily on fish—and if you don’t like them, it sucks to be you. For whatever reason, there are also a lot of uncooked vegetables served on the side, and the grilled meats were underwhelming.",
      "We suppose there’s a reason Cambodian restaurants aren’t taking over the world."
    ]
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
        <img
          class="cuisine-icon"
          src="${escapeHtml(chapter.icon)}"
          alt=""
          width="60"
          height="60"
          aria-hidden="true"
        >

        <div class="cuisine-chapter-copy">
          <h3 class="cuisine-item-title">
            <span class="cuisine-period">${escapeHtml(chapter.period)}</span>
            <span class="cuisine-dish">${escapeHtml(chapter.dish)}</span>
          </h3>
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
    const map = document.querySelector("[data-country-map]");
    const frame = root.querySelector(".cuisine-menu-frame");
    const menu = frame?.querySelector(".cuisine-menu");
    resizeCleanups.get(root)?.();

    if (!frame || !menu) return;

    const updateSize = (
      mapWidth = map?.getBoundingClientRect().width || COUNTRY_MAP_FIGMA_WIDTH,
    ) => {
      if (mapWidth <= 0) return;
      const scale = mapWidth / COUNTRY_MAP_FIGMA_WIDTH;
      const scaledWidth = MENU_FIGMA_WIDTH * scale;
      const scaledHeight = MENU_FIGMA_HEIGHT * scale;

      root.style.setProperty("--cuisine-menu-scaled-width", `${scaledWidth}px`);
      frame.style.width = `${scaledWidth}px`;
      frame.style.height = `${scaledHeight}px`;
      menu.style.setProperty("--cuisine-menu-scale", scale);
    };

    updateSize();

    if (!map) return;

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
  }

  function renderCuisine(root, data) {
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
      return DEFAULT_DATA;
    }

    try {
      const response = await fetch(source);

      if (!response.ok) {
        throw new Error(`Could not load ${source}: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(
        "[cuisine] Falling back to bundled Cambodia demo data.",
        error
      );
      return DEFAULT_DATA;
    }
  }

  async function initCuisine(root) {
    const data = await loadData(root);
    renderCuisine(root, data);
  }

  document.addEventListener("DOMContentLoaded", () => {
    document
      .querySelectorAll("[data-cuisine-component]")
      .forEach((root) => initCuisine(root));
  });

  window.ParetoCuisine = {
    render: renderCuisine,
    init: initCuisine
  };
})();
