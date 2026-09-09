import { initializeDestinations } from "./components/destinations.js";

const MOBILE_NAV_QUERY = "(max-width: 900px)";

function initializeHeader(header) {
  const toggle = header.querySelector(".nav-toggle");
  const navigation = header.querySelector(".nav");

  if (!toggle || !navigation) return;

  const closeMenu = ({ returnFocus = false } = {}) => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open navigation menu");

    if (returnFocus) toggle.focus();
  };

  initializeDestinations(header, closeMenu);

  toggle.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    toggle.setAttribute(
      "aria-label",
      willOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      closeMenu({ returnFocus: true });
    }
  });

  window.matchMedia(MOBILE_NAV_QUERY).addEventListener("change", closeMenu);
}

document.querySelectorAll(".header").forEach(initializeHeader);
