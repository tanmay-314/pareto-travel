# Pareto Travel

Pareto Travel is a static, editorial travel-guide website translated from a
Figma design system. It combines reusable HTML, CSS, and vanilla JavaScript
components with country-specific JSON content and SVG artwork. There is no
framework, package manager, bundler, database, or build step.

The current working experience is a reusable country-page composition populated
with Cambodia content. The landing page includes an interactive world map with
16 country overlays, but pages for those map destinations have not yet been
created.

## Current status

Last reviewed against the repository: **5 September 2026**.

Implemented:

- world-map landing page artwork and country hotspots;
- a data-driven Cambodia hero and annotated country map;
- a six-link in-hero passport-stamp navigation group;
- interactive polaroid itinerary;
- annual best-months travel dial;
- cuisine editorial/menu section;
- inter-city travel ticket;
- budget receipt;
- FAQ accordion and five-category country rating;
- generated `/countries/<slug>.html` entry pages backed by one shared template;
- shared design tokens, typography, global styles, accessibility states, and
  reduced-motion handling.

Still incomplete:

- Cambodia is the only country with complete section JSON;
- only Cambodia currently has published country data and a generated page;
- the header links for Destinations, Months, and About are placeholders;
- there is no production deployment configuration;
- there is no automated test, lint, formatting, or asset build pipeline;
- some internal documentation describes architectural goals as well as current
  behavior, so the source under `src/` remains authoritative.

The active project objective is to refine the reusable country page and its
redesigned navigation. See
[`codex-docs/PROJECT_STATUS.md`](codex-docs/PROJECT_STATUS.md) for the latest
handoff notes.

## Quick start

Only a modern browser and a local HTTP server are required. The JSON components
use `fetch()`, so opening the HTML with a `file://` URL will not work reliably.

From the repository root, serve `src` as the web root:

```bash
python3 -m http.server 8000 --directory src
```

Then open:

- landing page: <http://localhost:8000/pages/index.html>
- Cambodia country page: <http://localhost:8000/countries/cambodia.html>

No `npm install` or compile command is needed.

The pages import Google Fonts, so the complete typography requires an internet
connection. Local fallback families are used if the fonts cannot load.

## Repository layout

```text
pareto-travel/
├── README.md
├── src/
│   ├── pages/
│   │   ├── index.html                 # world-map landing page
│   │   └── country.html               # shared country-page source template
│   ├── countries/
│   │   └── cambodia.html              # committed generated public entry
│   ├── data/
│   │   ├── components/
│   │   │   └── country-navigation.json
│   │   └── countries/
│   │       └── cambodia/              # one JSON file per page section
│   ├── scripts/
│   │   ├── country-page.js            # page initialization and debug APIs
│   │   ├── components/                # component rendering and behavior
│   │   └── lib/component-utils.js     # shared fetch and resize utilities
│   ├── styles/
│   │   ├── reset.css
│   │   ├── tokens.css
│   │   ├── typography.css
│   │   ├── global.css
│   │   └── components/
│   └── assets/
│       ├── components/                # component-specific SVGs
│       ├── countries/                 # country map SVGs
│       ├── icons/
│       ├── images/                    # editorial illustrations
│       └── maps/                      # world and country-overlay SVGs
├── scripts/
│   └── generate-country-pages.py      # country entry-page generator
└── codex-docs/
    ├── AGENTS.md                      # repository guidance for Codex
    ├── PROJECT_STATUS.md              # current objective and handoff
    └── docs/                          # architecture and contribution guides
```

The top-level `dist/` directory is currently empty and is not part of the
runtime. Generated country pages are committed, so generation is not required
to serve the site.

## How the site works

The browser loads a static page and its foundation styles, followed by a single
country-page bootstrap. The bootstrap initializes side-effect-free component
modules, which discover mount points through `data-*` attributes, fetch JSON,
validate or normalize the data, construct semantic DOM, and bind interactions.

```text
HTML page
  ├── reset → tokens → typography → global CSS
  ├── component CSS
  └── data-* mount points
       └── country-page bootstrap
            └── component modules
                 ├── fetch country/section JSON
                 ├── validate and render
                 └── bind interaction, sizing, and motion behavior
```

Detailed component artwork is kept in external SVG files. Several physical
artifact-style components preserve their Figma geometry internally and scale in
relation to the live country-map width with `ResizeObserver` (falling back to a
window resize listener).

The country URL maps to a committed generated HTML entry. That entry declares a
lowercase kebab-case slug, and the country-page bootstrap validates it against
the corresponding published `country.json` before assigning every component's
data source. The bootstrap coordinates data loading but does not parse or route
URL paths.

## Pages

### Landing page

[`src/pages/index.html`](src/pages/index.html) renders the logo, primary
navigation, a base world map, and overlays for:

- United States, Mexico, Costa Rica, Colombia, Brazil, Peru, Bolivia, and Chile;
- Iceland, Turkey, Greece, India, Sri Lanka, Malaysia, Singapore, and Cambodia.

The SVG overlays exist, but only Cambodia is interactive while it is the only
published country. Add a link when the matching generated page exists.

### Country page

[`src/pages/country.html`](src/pages/country.html) is the shared source template.
[`src/countries/cambodia.html`](src/countries/cambodia.html) is its current
generated public entry and renders sections in this order:

1. hero, overview, passport-stamp navigation, and annotated country map;
2. two-day itinerary;
3. best time to visit;
4. cuisine;
5. inter-city travel;
6. budget;
7. FAQs and country review.

The country navigation tracks the section near the upper part of the viewport,
sets `aria-current`, and scrolls to sections. Smooth scrolling is disabled for
people who prefer reduced motion.

## Component map

| Component | Mount point | Data | Implementation |
| --- | --- | --- | --- |
| Country hero/map | `[data-country-hero]` | `country.json` | `country-hero.js`, `country-intro.css`, `country-map.css` |
| Country navigation | `[data-country-navigation]` | `data/components/country-navigation.json` | `country-navigation.js`, `country-navigation.css` |
| Polaroid itinerary | `[data-itinerary]` | `itinerary.json` | `itinerary.js`, `itinerary.css` |
| Best-months dial | `.annual-travel-dial[data-country]` | `best-months.json` | `best-months.js`, `best-months.css` |
| Cuisine | `[data-cuisine-component]` | `cuisine.json` | `cuisine.js`, `cuisine.css` |
| Inter-city travel | `[data-inter-city-travel]` | `inter-city-travel.json` | `inter-city-travel.js`, `inter-city-travel.css` |
| Budget receipt | `[data-budget-receipt]` | `budget.json` | `budget.js`, `budget.css` |
| FAQs/review | `[data-faqs]` | `faqs.json` + `country.json` | `faqs.js`, `country-rating.js`, matching CSS |

All implementation paths in the table are below `src/scripts/components/` or
`src/styles/components/` unless otherwise stated. Shared JSON fetching, retryable
request caching, and resize cleanup live in `src/scripts/lib/component-utils.js`.

### Interaction and fallback behavior

- The itinerary deals in when it first enters the viewport. Click, tap,
  keyboard selection, arrow keys, Home/End, and horizontal swipe can select a
  day. Reduced-motion users receive simplified transitions.
- The travel dial validates all 12 months as `best`, `good`, or `avoid` and
  includes a textual accessible summary.
- The FAQ component can allow one or multiple open answers; Cambodia currently
  allows one. It emits a `faqchange` custom event.
- Country navigation emits `country-navigation:select` on activation.
- Generated hero HTML contains the correct country fallback. If required
  country metadata cannot be loaded or validated, the controller replaces the
  page with a country-unavailable state and does not initialize components.
- Other components log actionable loading/rendering errors and either show a
  local error state, hide invalid optional output, or preserve a safe default.
- User-authored strings should be assigned with `textContent` or escaped before
  DOM insertion. Country map assets are restricted to same-origin URLs.

Several components also expose small browser globals for manual integration or
debugging: `CountryHero`, `CountryRating`, `AnnualTravelDial`, `BudgetReceipt`,
`ParetoCuisine`, `InterCityTravel`, `ParetoPolaroid`, and
`ParetoEditorialFaqs`.

## Country data

Cambodia's content lives in
[`src/data/countries/cambodia/`](src/data/countries/cambodia/):

| File | Owns |
| --- | --- |
| `country.json` | publication state, slug, country name, visit year, SEO, overview, five ratings, map asset, and map locations |
| `itinerary.json` | itinerary metadata, editorial copy, detail link, and ordered days |
| `best-months.json` | center label/value, editorial guidance, and 12 month states |
| `cuisine.json` | section title, up to three meal chapters, icons, dishes, and editorial copy |
| `inter-city-travel.json` | places, route legs, modes, durations, recommendation flags, and ticket/icon assets |
| `budget.json` | trip length, party size, year, five line items, total, and editorial copy |
| `faqs.json` | section title, accordion mode, and ordered questions/answers |

Important data conventions:

- directory names, slugs, IDs, and asset filenames use lowercase kebab-case;
- ordered arrays are significant;
- map locations use coordinates in the map's 720 × 720 design space;
- ratings require exactly five categories, use a 0–5 scale, and allow 0.5-point
  increments;
- best-month data must include each month once;
- budget values are authored display strings, including their currency symbol;
- content-specific alternative text belongs next to its asset reference;
- JSON contains content and constrained configuration, not HTML fragments or
  arbitrary CSS;
- relative asset references are resolved from the JSON source URL or component
  module according to the relevant component contract.

See [`codex-docs/docs/data-model.md`](codex-docs/docs/data-model.md) for example
contracts and [`codex-docs/docs/components.md`](codex-docs/docs/components.md)
for component-specific expectations.

## Adding another country

1. Create `src/data/countries/<country-slug>/` with the same section filenames
   used by Cambodia.
2. Add the country's map, world-map overlay, illustrations, and any other assets
   under the matching `src/assets/` areas.
3. Set `country.json`'s slug to the directory name, add `visitedYear` and SEO
   metadata, and set `status` to `published` only when the page is ready.
4. Keep the established JSON shapes and update content-specific paths and alt
   text.
5. Run `python3 scripts/generate-country-pages.py` and commit the generated
   `src/countries/<country-slug>.html` file. Use `--check` to verify that
   committed entries are current.
6. Add the landing-page link only after the generated entry exists.
7. Validate every JSON file and asset URL, then test every populated section and
   intentional missing/optional state through the HTTP server.

Do not silently introduce a second data organization scheme. If a schema must
change, update its consumers and the corresponding documentation together.

## Design system

Figma is the visual source of truth. The Pareto Travel design file ID is
`IBbYsd9B2ZHOq7NXfEUhtL`; implementation work should use the exact node URL from
the task because a file ID alone does not identify the intended design state.

The foundation stylesheet order is important:

```html
<link rel="stylesheet" href="../styles/reset.css">
<link rel="stylesheet" href="../styles/tokens.css">
<link rel="stylesheet" href="../styles/typography.css">
<link rel="stylesheet" href="../styles/global.css">
```

Component styles load after these files. Design tokens define a cream canvas,
plum brand palette, teal accent, a 6 px-derived spacing scale, Bitcount Grid
Single display type, and Iosevka Charon Mono body type. Do not duplicate a
reusable Figma value across component styles; add or reuse a semantic token.

The primary implementation principles are:

- translate the supplied Figma design rather than redesigning it;
- keep country content in JSON and presentation in HTML/CSS/JavaScript;
- keep components portable and scoped to their own roots;
- use semantic HTML, real links/buttons, visible focus, and meaningful text
  alternatives;
- preserve content for assistive technology when visual motion or decoration is
  removed;
- honor `prefers-reduced-motion`;
- do not add a framework, dependency, bundler, or build step without an explicit
  project decision.

## Development workflow

Before changing a component, locate its HTML mount point, stylesheet, script,
data source, and SVG/image assets. Establish the public data contract before
editing and preserve unrelated work in the repository.

For visual changes:

1. inspect the exact Figma node and its variables, constraints, states, and
   assets;
2. compare the current browser rendering at realistic content lengths;
3. make the smallest coherent change using existing tokens and patterns;
4. verify narrow mobile, tablet, laptop, and wide desktop layouts where the
   component applies;
5. verify pointer, keyboard, focus, and reduced-motion behavior;
6. inspect the browser console and network panel for new failures;
7. update data/component documentation if a public contract changed.

Useful repository-level checks:

```bash
# Confirm every JSON document parses.
find src/data -name '*.json' -exec python3 -m json.tool {} /dev/null \;

# Find the component mount points and their sources.
rg 'data-(source|config|country-source)=' src/pages

# Review the complete change before committing.
git diff -- README.md
```

There is currently no single automated `test` command. Browser verification is
required for UI work.

## Documentation

The deeper project documentation is kept under `codex-docs/`:

- [`AGENTS.md`](codex-docs/AGENTS.md) — repository guidance for Codex;
- [`PROJECT_STATUS.md`](codex-docs/PROJECT_STATUS.md) — active objective, known
  gaps, and handoff notes;
- [`architecture.md`](codex-docs/docs/architecture.md) — target layers, runtime
  flow, dependencies, error handling, performance, and security boundaries;
- [`design-system.md`](codex-docs/docs/design-system.md) — visual tokens,
  typography, assets, states, and motion;
- [`data-model.md`](codex-docs/docs/data-model.md) — JSON ownership and example
  shapes;
- [`components.md`](codex-docs/docs/components.md) — component contracts and
  implementation registry;
- [`figma-workflow.md`](codex-docs/docs/figma-workflow.md) — design-to-code
  fidelity workflow;
- [`development.md`](codex-docs/docs/development.md) — implementation,
  debugging, QA, and handoff practices;
- [`decisions.md`](codex-docs/docs/decisions.md) — durable architectural
  decisions.

When documentation and implementation disagree, verify the current source and
update both as part of the same change.

## Contribution checklist

- The result matches the supplied Figma node and does not redesign unrelated
  areas.
- JSON parses, required fields are validated, and asset paths resolve over HTTP.
- Country-specific content is not hard-coded into reusable component behavior.
- The browser console and network panel contain no new failures.
- Keyboard, focus, responsive, and reduced-motion behavior have been checked.
- Missing optional content has an intentional fallback.
- No secrets, temporary render files, or local server output are committed.
- Documentation reflects any architecture, schema, or component-contract change.

## License

No license file is currently included. Unless a license is added, do not assume
permission to redistribute the source or assets outside the repository.
