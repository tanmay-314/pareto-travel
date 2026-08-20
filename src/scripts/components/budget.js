(function () {
  "use strict";

  const DEFAULT_RECEIPT = Object.freeze({
    country: "MIDDLE EARTH",
    days: 0,
    people: 0,
    currency: "USD",
    lineItems: [
      { description: "STAYS · 0 NIGHTS", value: "$0" },
      { description: "FOOD & DRINKS", value: "$0" },
      { description: "EXPERIENCES", value: "$0" },
      { description: "INTRA-CITY TRAVEL", value: "$0" },
      { description: "MISCELANEOUS", value: "$0" }
    ],
    total: "$0"
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
      country: text(source.country, DEFAULT_RECEIPT.country),
      days: text(source.days, DEFAULT_RECEIPT.days),
      people: text(source.people, DEFAULT_RECEIPT.people),
      currency: text(source.currency, DEFAULT_RECEIPT.currency),
      lineItems: sourceItems.map(function (item) {
        return {
          description: text(item && item.description, "LINE ITEM"),
          value: text(item && item.value, "—")
        };
      }),
      total: text(source.total, DEFAULT_RECEIPT.total)
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

  function createRule(modifier) {
    const rule = element(
      "span",
      "budget-receipt__rule budget-receipt__rule--" + modifier
    );
    rule.setAttribute("aria-hidden", "true");
    return rule;
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

  function createReceipt(data, instanceNumber) {
    const receipt = normalizeReceipt(data);
    const article = element("article", "budget-receipt");
    const countryId = "budget-receipt-country-" + instanceNumber;

    article.setAttribute("aria-labelledby", countryId);

    const paper = element("span", "budget-receipt__paper");
    paper.setAttribute("aria-hidden", "true");

    const header = element("header", "budget-receipt__header");
    const brand = element("p", "budget-receipt__brand", "PARETO TRAVEL");
    const country = element("h2", "budget-receipt__country", receipt.country);
    country.id = countryId;
    header.append(brand, country);

    const meta = element(
      "p",
      "budget-receipt__meta",
      receipt.days + " DAYS ·  " + receipt.people + " PEOPLE ·  " + receipt.currency
    );

    const total = element("footer", "budget-receipt__total");
    const totalLabel = element("span", "budget-receipt__total-label", "TOTAL");
    const totalValue = element("strong", "budget-receipt__total-value", receipt.total);
    total.append(totalLabel, totalValue);

    article.append(
      paper,
      createRule("top"),
      createRule("header"),
      createRule("total"),
      createRule("bottom"),
      header,
      meta,
      createLineItems(receipt.lineItems),
      total
    );

    return article;
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

  async function mountReceipt(target, instanceNumber) {
    const source = target.dataset.source;

    try {
      const data = await loadReceiptData(source);
      target.replaceWith(createReceipt(data, instanceNumber));
    } catch (error) {
      /*
       * Opening index.html directly from Finder can block local JSON fetches.
       * The component still renders its Figma defaults; a local server will
       * load budget-receipt.json normally.
       */
      console.warn(error);
      target.replaceWith(createReceipt(DEFAULT_RECEIPT, instanceNumber));
    }
  }

  function initBudgetReceipts() {
    const targets = document.querySelectorAll("[data-budget-receipt]");

    targets.forEach(function (target, index) {
      mountReceipt(target, index + 1);
    });
  }

  window.BudgetReceipt = Object.freeze({
    defaults: DEFAULT_RECEIPT,
    create: function (data) {
      return createReceipt(data, Date.now());
    },
    mount: function (target, data) {
      if (!(target instanceof Element)) {
        throw new TypeError("BudgetReceipt.mount needs a valid DOM element.");
      }

      target.replaceChildren(createReceipt(data, Date.now()));
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBudgetReceipts, { once: true });
  } else {
    initBudgetReceipts();
  }
})();
