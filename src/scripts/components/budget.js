import { fetchJson, findCountryMap, observeResize } from "../lib/component-utils.js";

const COUNTRY_MAP_FIGMA_WIDTH = 720;
const RECEIPT_TO_MAP_WIDTH_RATIO = 7 / 12;
const RECEIPT_FIGMA_WIDTH =
  COUNTRY_MAP_FIGMA_WIDTH * RECEIPT_TO_MAP_WIDTH_RATIO;
const RECEIPT_FIGMA_HEIGHT = 540;
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

export const DEFAULT_RECEIPT = Object.freeze({
  days: "—",
  people: "—",
  year: "—",
  lineItems: [
    { description: "STAYS", value: "—" },
    { description: "FOOD & DRINKS", value: "—" },
    { description: "EXPERIENCES", value: "—" },
    { description: "INTER-CITY TRAVEL", value: "—" },
    { description: "MISCELLANEOUS", value: "—" }
  ],
  total: "—",
  editorial: []
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

export function createReceipt(data) {
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

  const meta = element("p", "budget-receipt__meta");
  const days = element("span", "budget-receipt__meta-group");
  const people = element("span", "budget-receipt__meta-group");

  days.append(
    element("span", "budget-receipt__meta-value", receipt.days),
    element("span", "budget-receipt__meta-label", "DAYS")
  );
  people.append(
    element("span", "budget-receipt__meta-value", receipt.people),
    element("span", "budget-receipt__meta-label", "PAX")
  );
  meta.append(
    days,
    element("span", "budget-receipt__meta-separator", "·"),
    people,
    element("span", "budget-receipt__meta-separator", "·"),
    element("span", "budget-receipt__meta-year", receipt.year)
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
  const map = findCountryMap(frame);

  if (!map) {
    frame.style.width = `${RECEIPT_FIGMA_WIDTH}px`;
    frame.style.height = `${RECEIPT_FIGMA_HEIGHT}px`;
    return;
  }

  observeResize(frame, map, () => {
    const mapWidth = map.getBoundingClientRect().width;
    if (mapWidth <= 0) return;
    const scaledWidth = mapWidth * RECEIPT_TO_MAP_WIDTH_RATIO;
    const scale = scaledWidth / RECEIPT_FIGMA_WIDTH;

    frame.style.width = `${scaledWidth}px`;
    frame.style.height = `${RECEIPT_FIGMA_HEIGHT * scale}px`;
    receipt.style.setProperty("--budget-receipt-scale", scale);
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
    throw new Error("Budget receipt needs a data-source attribute.");
  }

  return fetchJson(source, { label: "Budget data" });
}

export async function mountReceiptFromSource(target) {
  const source = target.dataset.source;
  const editorial = target
    .closest(".budget")
    ?.querySelector("[data-budget-editorial]");

  try {
    const data = await loadReceiptData(source);
    renderEditorial(editorial, data);
    replaceWithResponsiveReceipt(target, data);
  } catch (error) {
    const message = element(
      "p",
      "budget-receipt-error",
      "The budget estimate could not be loaded.",
    );
    message.setAttribute("role", "alert");
    target.replaceChildren(message);
    if (editorial) editorial.hidden = true;
    throw error;
  }
}

export function loadBudgetReceipts(scope = document) {
  const targets = scope.querySelectorAll("[data-budget-receipt]");
  return Promise.all([...targets].map(mountReceiptFromSource));
}

export function mountBudgetReceipt(target, data) {
  if (!(target instanceof Element)) {
    throw new TypeError("BudgetReceipt.mount needs a valid DOM element.");
  }

  const { frame, receipt } = createResponsiveReceipt(data);
  target.replaceChildren(frame);
  syncReceiptToCountryMap(frame, receipt);
  return frame;
}
