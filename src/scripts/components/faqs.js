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

  function createQuickReference(data) {
    const aside = createElement("aside", "quick-reference");
    aside.setAttribute("aria-labelledby", "quick-reference-title");

    const title = createElement("h2", "quick-reference-title", data.title);
    title.id = "quick-reference-title";
    aside.appendChild(title);
    aside.appendChild(createElement("p", "quick-reference-subtitle", data.subtitle));

    const list = createElement("dl", "quick-reference-list");
    (data.items || []).forEach(function (item) {
      const group = createElement("div", "quick-reference-item");
      group.appendChild(createElement("dt", "quick-reference-label", item.label));
      group.appendChild(createElement("dd", "quick-reference-value", item.value));
      list.appendChild(group);
    });

    if (data.note) {
      const note = createElement("div", "quick-reference-item quick-reference-item--note");
      note.appendChild(createElement("dt", "quick-reference-label", data.note.label));
      note.appendChild(createElement("dd", "quick-reference-value", data.note.value));
      list.appendChild(note);
    }

    aside.appendChild(list);
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

  function render(root, data) {
    root.replaceChildren();

    const titleRow = createElement("div", "faqs-title-row");
    titleRow.appendChild(createElement("h1", "faqs-title", data.sectionTitle || "FAQS"));

    const body = createElement("div", "faqs-body");
    body.appendChild(createQuickReference(data.quickReference || {}));

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
    root.appendChild(createElement("div", "faqs-rule"));
    root.appendChild(body);
  }

  async function init(root) {
    const source = root.dataset.source || "../data/countries/cambodia/faqs.json";

    try {
      const response = await fetch(new URL(source, document.baseURI));
      if (!response.ok) throw new Error("FAQ data request failed with status " + response.status);
      const data = await response.json();
      render(root, data);
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