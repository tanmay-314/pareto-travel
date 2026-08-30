(function () {
  "use strict";

  const COUNTRY_MAP_FIGMA_WIDTH = 720;
  const RECEIPT_TO_MAP_WIDTH_RATIO = 7 / 12;
  const RECEIPT_FIGMA_WIDTH =
    COUNTRY_MAP_FIGMA_WIDTH * RECEIPT_TO_MAP_WIDTH_RATIO;
  const RECEIPT_FIGMA_HEIGHT = 540;
  const receiptResizeCleanups = new WeakMap();
  const RECEIPT_ASSETS = Object.freeze({
    perforation: new URL(
      "../../assets/components/budget/perforation.svg",
      import.meta.url
    ).href,
    top: new URL(
      "../../assets/components/budget/receipt-top.svg",
      import.meta.url
    ).href,
    separatorHeader: new URL(
      "../../assets/components/budget/separator-1.svg",
      import.meta.url
    ).href,
    separatorTotal: new URL(
      "../../assets/components/budget/separator-2.svg",
      import.meta.url
    ).href
  });

  const DEFAULT_RECEIPT = Object.freeze({
    days: 5,
    people: 2,
    year: "2025",
    lineItems: [
      { description: "STAYS · 5 NIGHTS", value: "$420" },
      { description: "FOOD & DRINKS", value: "$210" },
      { description: "EXPERIENCES", value: "$160" },
      { description: "INTER-CITY TRAVEL", value: "$100" },
      { description: "MISCELLANEOUS", value: "$50" }
    ],
    total: "$940",
    editorial: [
      "This five-day estimate covers two travellers sharing rooms and splitting transport. Cambodia rewards a flexible budget: guesthouses and local food keep daily costs low, while Angkor passes, private transfers and a few considered splurges account for most of the total."
    ]
  });

  function text(value, fallback) {
    if (value === null || value === undefined || value === "") {
      return String(fallback);
    }

    return String(value);
  }

  function normalizeReceipt(data) {
    const source = data && typeof data === "object" ? data : {};
    const sourceItems = Array.isArray(source.lineItems)
      ? source.lineItems
      : DEFAULT_RECEIPT.lineItems;

    return {
      days: text(source.days, DEFAULT_RECEIPT.days),
      people: text(source.people, DEFAULT_RECEIPT.people),
      year: text(source.year, DEFAULT_RECEIPT.year),
      lineItems: sourceItems
        .slice(0, DEFAULT_RECEIPT.lineItems.length)
        .map(function (item) {
          return {
            description: text(item && item.description, "LINE ITEM"),
            value: text(item && item.value, "—")
          };
        }),
      total: text(source.total, DEFAULT_RECEIPT.total),
      editorial: Array.isArray(source.editorial)
        ? source.editorial.filter(function (paragraph) {
            return typeof paragraph === "string" && paragraph.trim().length > 0;
          })
        : DEFAULT_RECEIPT.editorial
    };
  }

  function element(tagName, className, content) {
    const node = document.createElement(tagName);

    if (className) {
      node.className = className;
    }

    if (content !== undefined) {
      node.textContent = content;
    }

    return node;
  }

  function createDecorativeImage(modifier, source) {
    const image = element(
      "img",
      "budget-receipt__decoration budget-receipt__decoration--" + modifier
    );
    image.src = source;
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    return image;
  }

  function createLineItems(items) {
    const list = element("dl", "budget-receipt__line-items");

    items.forEach(function (item) {
      const row = element("div", "budget-receipt__line-item");
      const description = element(
        "dt",
        "budget-receipt__line-description",
        item.description
      );
      const value = element("dd", "budget-receipt__line-value", item.value);

      row.append(description, value);
      list.append(row);
    });

    return list;
  }

  function renderEditorial(target, data) {
    if (!target) return;

    const receipt = normalizeReceipt(data);
    const paragraphs = receipt.editorial.map(function (content) {
      return element("p", "budget-editorial-copy", content);
    });

    target.replaceChildren(...paragraphs);
    target.hidden = paragraphs.length === 0;
  }

  function createReceipt(data) {
    const receipt = normalizeReceipt(data);
    const article = element("article", "budget-receipt");
    article.setAttribute(
      "aria-label",
      "Budget estimate for " +
        receipt.days +
        " days and " +
        receipt.people +
        " people in " +
        receipt.year
    );

    const paper = element("span", "budget-receipt__paper");
    paper.setAttribute("aria-hidden", "true");

    const meta = element(
      "p",
      "budget-receipt__meta",
      receipt.days + " DAYS · " + receipt.people + " PAX · " + receipt.year
    );

    const total = element("footer", "budget-receipt__total");
    const totalLabel = element("span", "budget-receipt__total-label", "TOTAL");
    const totalValue = element("strong", "budget-receipt__total-value", receipt.total);
    total.append(totalLabel, totalValue);

    article.append(
      createDecorativeImage("perforation", RECEIPT_ASSETS.perforation),
      paper,
      createDecorativeImage("top", RECEIPT_ASSETS.top),
      createDecorativeImage("header-rule", RECEIPT_ASSETS.separatorHeader),
      createDecorativeImage("total-rule", RECEIPT_ASSETS.separatorTotal),
      createDecorativeImage("bottom-rule", RECEIPT_ASSETS.separatorTotal),
      meta,
      createLineItems(receipt.lineItems),
      total
    );

    return article;
  }

  function syncReceiptToCountryMap(frame, receipt) {
    const map = document.querySelector("[data-country-map]");
    receiptResizeCleanups.get(frame)?.();

    if (!map) {
      frame.style.width = `${RECEIPT_FIGMA_WIDTH}px`;
      frame.style.height = `${RECEIPT_FIGMA_HEIGHT}px`;
      return;
    }

    const updateLayout = () => {
      const mapWidth = map.getBoundingClientRect().width;
      if (mapWidth <= 0) return;
      const scaledWidth = mapWidth * RECEIPT_TO_MAP_WIDTH_RATIO;
      const scale = scaledWidth / RECEIPT_FIGMA_WIDTH;

      frame.style.width = `${scaledWidth}px`;
      frame.style.height = `${RECEIPT_FIGMA_HEIGHT * scale}px`;
      receipt.style.setProperty("--budget-receipt-scale", scale);
    };

    updateLayout();

    if (typeof ResizeObserver === "function") {
      const observer = new ResizeObserver(updateLayout);
      observer.observe(map);
      observer.observe(receipt);
      receiptResizeCleanups.set(frame, () => observer.disconnect());
      return;
    }

    window.addEventListener("resize", updateLayout);
    receiptResizeCleanups.set(frame, () => {
      window.removeEventListener("resize", updateLayout);
    });
  }

  function createResponsiveReceipt(data) {
    const frame = element("div", "budget-receipt-frame");
    const receipt = createReceipt(data);
    frame.append(receipt);
    return { frame, receipt };
  }

  function replaceWithResponsiveReceipt(target, data) {
    const { frame, receipt } = createResponsiveReceipt(data);
    target.replaceWith(frame);
    syncReceiptToCountryMap(frame, receipt);
    return frame;
  }

  async function loadReceiptData(source) {
    if (!source) {
      return DEFAULT_RECEIPT;
    }

    const response = await fetch(source);

    if (!response.ok) {
      throw new Error("Could not load receipt data (HTTP " + response.status + ").");
    }

    return response.json();
  }

  async function mountReceipt(target) {
    const source = target.dataset.source;
    const editorial = target
      .closest(".budget")
      ?.querySelector("[data-budget-editorial]");

    try {
      const data = await loadReceiptData(source);
      renderEditorial(editorial, data);
      replaceWithResponsiveReceipt(target, data);
    } catch (error) {
      /*
       * Opening index.html directly from Finder can block local JSON fetches.
       * The component still renders its Figma defaults; a local server will
       * load budget.json normally.
      */
      console.warn(error);
      renderEditorial(editorial, DEFAULT_RECEIPT);
      replaceWithResponsiveReceipt(target, DEFAULT_RECEIPT);
    }
  }

  function initBudgetReceipts() {
    const targets = document.querySelectorAll("[data-budget-receipt]");

    targets.forEach(function (target) {
      mountReceipt(target);
    });
  }

  window.BudgetReceipt = Object.freeze({
    defaults: DEFAULT_RECEIPT,
    create: function (data) {
      return createReceipt(data);
    },
    mount: function (target, data) {
      if (!(target instanceof Element)) {
        throw new TypeError("BudgetReceipt.mount needs a valid DOM element.");
      }

      const { frame, receipt } = createResponsiveReceipt(data);
      target.replaceChildren(frame);
      syncReceiptToCountryMap(frame, receipt);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBudgetReceipts, { once: true });
  } else {
    initBudgetReceipts();
  }
})();
