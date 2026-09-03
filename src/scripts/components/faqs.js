import { renderCountryRating } from "./country-rating.js";

(function () {
  "use strict";

  const ROOT_SELECTOR = "[data-faqs]";

  function createElement(tagName, className, text) {
    const node = document.createElement(tagName);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function createDottedIcon() {
    const icon = createElement("span", "faq-item-icon");
    icon.setAttribute("aria-hidden", "true");

    ["h1", "h2", "h3", "h4", "h5"].forEach(function (position) {
      icon.appendChild(createElement("span", "faq-item-icon-dot faq-item-icon-dot--" + position));
    });

    ["v1", "v2", "v4", "v5"].forEach(function (position) {
      icon.appendChild(
        createElement(
          "span",
          "faq-item-icon-dot faq-item-icon-dot--vertical faq-item-icon-dot--" + position
        )
      );
    });

    return icon;
  }

  function createQuickReference(countryData, titleId) {
    const countryName = typeof countryData?.name === "string"
      ? countryData.name.trim()
      : "";

    if (!countryName) {
      throw new Error("FAQ review needs a country name.");
    }

    const aside = createElement("aside", "quick-reference");
    aside.setAttribute("aria-labelledby", titleId);

    const title = createElement(
      "h2",
      "quick-reference-title",
      countryName.toUpperCase() + " REVIEW"
    );
    title.id = titleId;
    aside.appendChild(title);

    const rating = createElement("div", "country-rating");
    rating.setAttribute("aria-label", countryName + " ratings");
    renderCountryRating(rating, countryData);
    aside.appendChild(rating);

    return aside;
  }

  function setExpanded(row, expanded) {
    const button = row.querySelector(".faq-item-question");
    const answer = row.querySelector(".faq-item-answer");

    row.classList.toggle("is-open", expanded);
    button.setAttribute("aria-expanded", String(expanded));
    answer.hidden = !expanded;
  }

  function createFaqItem(item, position) {
    const safeId = String(item.id || "item-" + position).replace(/[^a-zA-Z0-9_-]/g, "-");
    const answerId = "faq-answer-" + safeId;
    const questionId = "faq-question-" + safeId;

    const row = createElement("article", "faq-item");
    row.dataset.faqId = safeId;

    const button = createElement("button", "faq-item-question");
    button.type = "button";
    button.id = questionId;
    button.setAttribute("aria-controls", answerId);
    button.appendChild(createElement("span", "faq-item-index", item.index || String(position + 1).padStart(2, "0")));
    button.appendChild(createElement("span", "faq-item-question-text", item.question));
    button.appendChild(createDottedIcon());

    const answer = createElement("p", "faq-item-answer", item.answer || "");
    answer.id = answerId;
    answer.setAttribute("role", "region");
    answer.setAttribute("aria-labelledby", questionId);

    row.appendChild(button);
    row.appendChild(answer);
    row.appendChild(createElement("div", "faq-item-rule"));
    setExpanded(row, Boolean(item.open));

    return row;
  }

  function render(root, data, countryData) {
    root.replaceChildren();

    const titleRow = createElement("div", "faqs-title-row");
    titleRow.appendChild(
      createElement(
        "h1",
        "faqs-title country-sub-heading",
        data.sectionTitle || "FAQS"
      )
    );

    const body = createElement("div", "faqs-body");
    const quickReferenceTitleId = (root.id || "faqs") + "-review-title";
    body.appendChild(createQuickReference(countryData, quickReferenceTitleId));

    const list = createElement("div", "faq-list");
    list.dataset.allowMultiple = String(Boolean(data.allowMultiple));
    (data.items || []).forEach(function (item, index) {
      list.appendChild(createFaqItem(item, index));
    });

    list.addEventListener("click", function (event) {
      const button = event.target.closest(".faq-item-question");
      if (!button || !list.contains(button)) return;

      const selectedRow = button.closest(".faq-item");
      const nextState = button.getAttribute("aria-expanded") !== "true";

      if (nextState && list.dataset.allowMultiple !== "true") {
        list.querySelectorAll(".faq-item.is-open").forEach(function (row) {
          if (row !== selectedRow) setExpanded(row, false);
        });
      }

      setExpanded(selectedRow, nextState);
      root.dispatchEvent(
        new CustomEvent("faqchange", {
          bubbles: true,
          detail: { id: selectedRow.dataset.faqId, open: nextState }
        })
      );
    });

    body.appendChild(list);
    root.appendChild(titleRow);
    root.appendChild(body);
  }

  async function fetchJson(source, label) {
    const response = await fetch(new URL(source, document.baseURI));
    if (!response.ok) {
      throw new Error(label + " data request failed with status " + response.status);
    }

    return response.json();
  }

  async function init(root) {
    const source = root.dataset.source || "../data/countries/cambodia/faqs.json";
    const countrySource = root.dataset.countrySource;

    try {
      if (!countrySource) {
        throw new Error("FAQ review needs a data-country-source attribute.");
      }

      const [data, countryData] = await Promise.all([
        fetchJson(source, "FAQ"),
        fetchJson(countrySource, "Country")
      ]);
      render(root, data, countryData);
      return root;
    } catch (error) {
      root.replaceChildren(createElement("p", "faqs-error", "Unable to load the FAQ content."));
      console.error(error);
      throw error;
    }
  }

  function initAll(scope) {
    return Promise.all(Array.from((scope || document).querySelectorAll(ROOT_SELECTOR), init));
  }

  window.ParetoEditorialFaqs = Object.freeze({ init: init, initAll: initAll, render: render });

  function autoInit() {
    initAll(document).catch(function () {
      // Individual roots already render their own error state.
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInit, { once: true });
  } else {
    autoInit();
  }
})();
