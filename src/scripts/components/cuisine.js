(() => {
  "use strict";

  const ICON_TO_MAP_SIZE_RATIO = 1 / 12;
  const resizeCleanups = new WeakMap();

  const DEFAULT_DATA = {
    title: "CUISINE",
    lede:
      "A quick way into Cambodia’s food culture — what to order, when to eat it, and the dishes worth planning a day around.",
    chapters: [
      {
        period: "MORNING",
        icon: "./assets/icon-morning.svg",
        dish: "Nom banh chok",
        description:
          "Cool rice noodles, green fish curry and a fistful of herbs — Cambodia’s most quietly perfect breakfast.",
        note: "GO BEFORE 9 AM · MARKET STALLS"
      },
      {
        period: "MIDDAY",
        icon: "./assets/icon-afternoon.svg",
        dish: "Fish amok",
        description:
          "Freshwater fish steamed with coconut custard and kroeung. Subtle, aromatic, and much better than its tourist-menu reputation.",
        note: "ORDER WITH RICE · SHAREABLE"
      },
      {
        period: "AFTER DARK",
        icon: "./assets/icon-night.svg",
        dish: "Beef lok lak",
        description:
          "Peppery seared beef, crisp vegetables and a sharp lime dip: the easy crowd-pleaser after a temple-heavy day.",
        note: "BEST WITH KAMPOT PEPPER"
      }
    ],
    paretoPick: {
      label: "PARETO PICK",
      copy:
        "Spend less time chasing restaurant lists: one market breakfast, one home-style lunch, one good Kampot-pepper dinner."
    }
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
          <p class="cuisine-period">${escapeHtml(chapter.period)}</p>
          <div class="cuisine-chapter-spacer" aria-hidden="true"></div>

          <h3 class="cuisine-dish">${escapeHtml(chapter.dish)}</h3>
          <p class="cuisine-description">${escapeHtml(chapter.description)}</p>

          <div class="cuisine-chapter-spacer" aria-hidden="true"></div>
          <p class="cuisine-note">${escapeHtml(chapter.note)}</p>
        </div>
      </article>
    `;
  }

  function syncIconSizeToCountryMap(root) {
    const map = document.querySelector("[data-country-map]");
    resizeCleanups.get(root)?.();

    if (!map) return;

    const updateSize = (mapWidth = map.getBoundingClientRect().width) => {
      if (mapWidth <= 0) return;
      root.style.setProperty(
        "--country-section-icon-size",
        `${mapWidth * ICON_TO_MAP_SIZE_RATIO}px`,
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
  }

  function renderCuisine(root, data) {
    const chapters = Array.isArray(data.chapters)
      ? data.chapters.slice(0, 3)
      : DEFAULT_DATA.chapters;

    root.innerHTML = `

      <div class="cuisine-title-row">
        <h2 class="cuisine-title" id="cuisine-title">
          ${escapeHtml(data.title || "CUISINE")}
        </h2>

        <p class="cuisine-lede">${escapeHtml(data.lede)}</p>
      </div>

      <div class="cuisine-rule" aria-hidden="true"></div>

      <div class="cuisine-chapters">
        ${chapters.map(renderChapter).join("")}
      </div>

      <aside class="cuisine-pareto">
        <span class="cuisine-pareto-marker" aria-hidden="true"></span>
        <span class="cuisine-pareto-label">
          ${escapeHtml(data.paretoPick?.label || "PARETO PICK")}
        </span>
        <p class="cuisine-pareto-copy">
          ${escapeHtml(data.paretoPick?.copy || "")}
        </p>
      </aside>
    `;

    syncIconSizeToCountryMap(root);
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
