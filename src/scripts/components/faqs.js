import { renderCountryRating } from "./country-rating.js";
import { fetchJson } from "../lib/component-utils.js";

const ROOT_SELECTOR = "[data-faqs]";
const ACCORDION_OPEN_ICON = new URL(
  "../../assets/icons/icon-accordion-open.svg",
  import.meta.url
).href;
const ACCORDION_CLOSE_ICON = new URL(
  "../../assets/icons/icon-accordion-close.svg",
  import.meta.url
).href;

function createElement(tagName, className, text) {
  const node = document.createElement(tagName);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createAccordionIcon() {
  const icon = createElement("span", "faq-item-icon");
  icon.setAttribute("aria-hidden", "true");
  icon.dataset.openIcon = ACCORDION_OPEN_ICON;
  icon.dataset.closeIcon = ACCORDION_CLOSE_ICON;

  return icon;
}

function createQuickReference(countryData) {
  const countryName = typeof countryData?.name === "string"
    ? countryData.name.trim()
    : "";

  if (!countryName) {
    throw new Error("FAQ review needs a country name.");
  }

  const aside = createElement("aside", "quick-reference");
  aside.setAttribute("aria-label", countryName + " travel ratings");

  const rating = createElement("div", "country-rating");
  rating.setAttribute("aria-label", countryName + " ratings");
  renderCountryRating(rating, countryData);
  aside.appendChild(rating);

  return aside;
}

function setExpanded(row, expanded) {
  const button = row.querySelector(".faq-item-question");
  const answer = row.querySelector(".faq-item-answer");
  const icon = row.querySelector(".faq-item-icon");

  row.classList.toggle("is-open", expanded);
  button.setAttribute("aria-expanded", String(expanded));
  answer.hidden = !expanded;
  const iconUrl = expanded ? icon.dataset.closeIcon : icon.dataset.openIcon;
  icon.style.setProperty("--faq-item-icon-image", `url("${iconUrl}")`);
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
  button.appendChild(createAccordionIcon());

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

export function render(root, data, countryData) {
  root.replaceChildren();

  const titleRow = createElement("div", "faqs-title-row");
  titleRow.appendChild(
    createElement(
      "h2",
      "faqs-title country-section-title country-sub-heading",
      data.sectionTitle || "FAQS"
    )
  );

  const body = createElement("div", "faqs-body");

  const list = createElement("div", "faq-list");
  list.dataset.allowMultiple = String(Boolean(data.allowMultiple));
  (data.items || []).forEach(function (item, index) {
    list.appendChild(createFaqItem(item, index));
  });

  body.appendChild(list);
  body.appendChild(createQuickReference(countryData));

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

  root.appendChild(titleRow);
  root.appendChild(body);
}

export async function init(root) {
  const source = root.dataset.source;
  const countrySource = root.dataset.countrySource;

  try {
    if (!source) {
      throw new Error("FAQ component needs a data-source attribute.");
    }

    if (!countrySource) {
      throw new Error("FAQ review needs a data-country-source attribute.");
    }

    const [data, countryData] = await Promise.all([
      fetchJson(source, { label: "FAQ data" }),
      fetchJson(countrySource, { label: "Country data" })
    ]);
    render(root, data, countryData);
    return root;
  } catch (error) {
    root.replaceChildren(createElement("p", "faqs-error", "Unable to load the FAQ content."));
    console.error(error);
    throw error;
  }
}

export function initAll(scope = document) {
  return Promise.all([...scope.querySelectorAll(ROOT_SELECTOR)].map(init));
}
