const SVG_NS = "http://www.w3.org/2000/svg";

const MONTHS = [
  { key: "jan", label: "JAN" },
  { key: "feb", label: "FEB" },
  { key: "mar", label: "MAR" },
  { key: "apr", label: "APR" },
  { key: "may", label: "MAY" },
  { key: "jun", label: "JUN" },
  { key: "jul", label: "JUL" },
  { key: "aug", label: "AUG" },
  { key: "sep", label: "SEP" },
  { key: "oct", label: "OCT" },
  { key: "nov", label: "NOV" },
  { key: "dec", label: "DEC" },
];

const VALID_STATES = new Set(["best", "good", "avoid"]);
const sourceCache = new Map();
let dialInstanceId = 0;

const DIAL_VIEWBOX_SIZE = 480;
const DIAL_TO_MAP_SIZE_RATIO = 2 / 3;
const dialResizeCleanups = new WeakMap();

const geometry = {
  centerX: DIAL_VIEWBOX_SIZE / 2,
  centerY: DIAL_VIEWBOX_SIZE / 2,
  dotRadius: 3,
  ringRadius: 230,
  labelRadius: 190,
  dotsPerMonth: 12,
  monthArcDegrees: 24,
  centerCircleRadius: 124,
};

function svgNode(name, attributes = {}) {
  const node = document.createElementNS(SVG_NS, name);

  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, String(value));
  });

  return node;
}

function pointOnCircle(angleInDegrees, radius) {
  const angle = (angleInDegrees * Math.PI) / 180;

  return {
    x: geometry.centerX + Math.cos(angle) * radius,
    y: geometry.centerY + Math.sin(angle) * radius,
  };
}

function normalizeState(value, month) {
  const state = String(value).toLowerCase();

  if (!VALID_STATES.has(state)) {
    throw new Error(`${month} must be Best, Good, or Avoid.`);
  }

  return state;
}

function validateConfig(config) {
  if (!config || typeof config !== "object") {
    throw new Error("The selected country is missing from the data file.");
  }

  if (!config.centerLabel || !config.centerValue || !config.months) {
    throw new Error("Country data needs centerLabel, centerValue, and months.");
  }

  return {
    country: config.country || "Selected country",
    centerLabel: String(config.centerLabel),
    centerValue: String(config.centerValue),
    months: Object.fromEntries(
      MONTHS.map(({ key, label }) => [
        key,
        normalizeState(config.months[key], label),
      ]),
    ),
  };
}

function makeAccessibleSummary(config) {
  return ["best", "good", "avoid"]
    .map((state) => {
      const monthNames = MONTHS.filter(
        ({ key }) => config.months[key] === state,
      ).map(({ label }) => label);

      return `${state}: ${monthNames.join(", ") || "none"}`;
    })
    .join("; ");
}

function buildMonthSegment(month, monthIndex, state) {
  const group = svgNode("g", {
    class: "annual-travel-dial__segment",
    "data-state": state,
    "aria-label": `${month.label}: ${state}`,
  });
  const centerAngle = -90 + monthIndex * 30;
  const startAngle = centerAngle - geometry.monthArcDegrees / 2;
  const step = geometry.monthArcDegrees / (geometry.dotsPerMonth - 1);
  const labelPoint = pointOnCircle(centerAngle, geometry.labelRadius);

  for (let dotIndex = 0; dotIndex < geometry.dotsPerMonth; dotIndex += 1) {
    const point = pointOnCircle(
      startAngle + dotIndex * step,
      geometry.ringRadius,
    );

    group.append(
      svgNode("circle", {
        class: "annual-travel-dial__dot",
        cx: point.x.toFixed(2),
        cy: point.y.toFixed(2),
        r: geometry.dotRadius,
      }),
    );
  }

  const label = svgNode("text", {
    class: "annual-travel-dial__month",
    x: labelPoint.x.toFixed(2),
    y: labelPoint.y.toFixed(2),
    "dominant-baseline": "middle",
  });
  label.textContent = month.label;
  group.append(label);

  return group;
}

function syncToCountryMap(container) {
  const map = document.querySelector("[data-country-map]");
  dialResizeCleanups.get(container)?.();

  if (!map) return;

  const updateSize = (mapWidth = map.getBoundingClientRect().width) => {
    if (mapWidth <= 0) return;
    container.style.setProperty(
      "--annual-travel-dial-size",
      `${mapWidth * DIAL_TO_MAP_SIZE_RATIO}px`,
    );
  };

  updateSize();

  if (typeof ResizeObserver === "function") {
    const observer = new ResizeObserver(([entry]) => {
      updateSize(entry.contentRect.width);
    });
    observer.observe(map);
    dialResizeCleanups.set(container, () => observer.disconnect());
    return;
  }

  const handleResize = () => updateSize();
  window.addEventListener("resize", handleResize);
  dialResizeCleanups.set(container, () => {
    window.removeEventListener("resize", handleResize);
  });
}

export function renderAnnualTravelDial(container, rawConfig) {
  const config = validateConfig(rawConfig);
  dialInstanceId += 1;
  const titleId = `annual-dial-title-${dialInstanceId}`;
  const descriptionId = `annual-dial-description-${dialInstanceId}`;
  const svg = svgNode("svg", {
    class: "annual-travel-dial__svg",
    viewBox: `0 0 ${DIAL_VIEWBOX_SIZE} ${DIAL_VIEWBOX_SIZE}`,
    role: "img",
    "aria-labelledby": `${titleId} ${descriptionId}`,
    preserveAspectRatio: "xMidYMid meet",
  });

  const title = svgNode("title", { id: titleId });
  title.textContent = `${config.country} annual travel dial`;
  const description = svgNode("desc", { id: descriptionId });
  description.textContent = `${config.centerLabel}: ${config.centerValue}. ${makeAccessibleSummary(config)}.`;

  svg.append(
    title,
    description,
    svgNode("rect", {
      width: DIAL_VIEWBOX_SIZE,
      height: DIAL_VIEWBOX_SIZE,
      fill: "var(--dial-background)",
    }),
    svgNode("circle", {
      cx: geometry.centerX,
      cy: geometry.centerY,
      r: geometry.centerCircleRadius,
      fill: "var(--dial-center-fill)",
    }),
  );

  const ring = svgNode("g", {
    class: "annual-travel-dial__ring",
  });

  MONTHS.forEach((month, index) => {
    ring.append(buildMonthSegment(month, index, config.months[month.key]));
  });

  svg.append(ring);

  const centerLabel = svgNode("text", {
    class: "annual-travel-dial__center-label",
    x: geometry.centerX,
    y: geometry.centerY - 27,
    "dominant-baseline": "middle",
  });
  centerLabel.textContent = config.centerLabel;

  const centerValue = svgNode("text", {
    class: "annual-travel-dial__center-value",
    x: geometry.centerX,
    y: geometry.centerY + 14,
    "dominant-baseline": "middle",
  });
  centerValue.textContent = config.centerValue;

  svg.append(centerLabel, centerValue);

  const caption = container.querySelector("figcaption");
  container.replaceChildren(svg);
  if (caption) {
    caption.textContent = description.textContent;
    container.append(caption);
  }
  syncToCountryMap(container);
  container.removeAttribute("aria-busy");
}

async function loadSource(source) {
  if (!sourceCache.has(source)) {
    sourceCache.set(
      source,
      fetch(source).then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load ${source} (${response.status}).`);
        }

        return response.json();
      }),
    );
  }

  return sourceCache.get(source);
}

function showError(container, error) {
  const message = document.createElement("p");
  message.className = "annual-travel-dial__error";
  message.textContent = error.message;
  container.replaceChildren(message);
  container.removeAttribute("aria-busy");
}

function appendFormattedEditorialText(paragraph, text) {
  let cursor = 0;

  for (const match of text.matchAll(/\*\*(.+?)\*\*/g)) {
    if (match.index > cursor) {
      paragraph.append(document.createTextNode(text.slice(cursor, match.index)));
    }

    const strong = document.createElement("strong");
    strong.textContent = match[1];
    paragraph.append(strong);
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    paragraph.append(document.createTextNode(text.slice(cursor)));
  }
}

export function renderBestMonthsEditorial(container, rawEditorial) {
  if (!container) return null;

  const paragraphs = Array.isArray(rawEditorial)
    ? rawEditorial.filter(
        (paragraph) =>
          typeof paragraph === "string" && paragraph.trim().length > 0,
      )
    : [];

  container.replaceChildren(
    ...paragraphs.map((text) => {
      const paragraph = document.createElement("p");
      appendFormattedEditorialText(paragraph, text);
      return paragraph;
    }),
  );
  container.hidden = paragraphs.length === 0;

  return container;
}

export async function setDialCountry(container, countryKey) {
  const source = container.dataset.source || "../data/country/cambodia/best-months.json";
  container.dataset.country = countryKey;
  container.setAttribute("aria-busy", "true");

  try {
    const data = await loadSource(source);
    const countryConfig = data.countries?.[countryKey];
    renderAnnualTravelDial(container, countryConfig);
    renderBestMonthsEditorial(
      container
        .closest(".best-months")
        ?.querySelector("[data-best-months-editorial]"),
      countryConfig?.editorial,
    );
  } catch (error) {
    showError(container, error);
  }
}

export async function loadAnnualTravelDials() {
  const dials = document.querySelectorAll(".annual-travel-dial[data-country]");

  await Promise.all(
    [...dials].map((dial) => setDialCountry(dial, dial.dataset.country)),
  );
}

window.AnnualTravelDial = {
  render: renderAnnualTravelDial,
  setCountry: setDialCountry,
  loadAll: loadAnnualTravelDials,
};

loadAnnualTravelDials();
