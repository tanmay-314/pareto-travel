# Pareto Travel

Pareto Travel is an editorial travel website built from a Figma design system. It uses reusable HTML, CSS, and JavaScript components with JSON-driven country content.

This README is the starting point for both human contributors and Codex. Stable implementation rules live in `AGENTS.md`; deeper technical guidance lives in `docs/`.

## Start here

Read these files before making a substantial change:

1. [`AGENTS.md`](AGENTS.md) — binding project instructions for Codex
2. [`PROJECT_STATUS.md`](PROJECT_STATUS.md) — current state, priorities, and known gaps
3. [`docs/architecture.md`](docs/architecture.md) — system structure and runtime flow
4. [`docs/design-system.md`](docs/design-system.md) — tokens, typography, and visual rules
5. [`docs/data-model.md`](docs/data-model.md) — country and component data contracts
6. [`docs/components.md`](docs/components.md) — reusable component conventions
7. [`docs/figma-workflow.md`](docs/figma-workflow.md) — Figma-to-code process
8. [`docs/development.md`](docs/development.md) — local development and verification
9. [`docs/decisions.md`](docs/decisions.md) — architectural decision log

## Project principles

- Figma is the visual source of truth.
- Design fidelity is a requirement.
- Country pages are generated from reusable components and country-specific JSON.
- Content belongs in data; presentation belongs in HTML, CSS, and JavaScript.
- Components should remain portable and usable without a frontend framework.
- Accessibility and reduced-motion behavior are part of the design.
- Code should remain readable to someone learning frontend development.

## Technology

- HTML5
- CSS with custom properties
- Vanilla JavaScript
- JSON content
- SVG and optimized raster assets

Do not introduce a framework, bundler, package, or build step without an explicit project decision.

## Expected structure

The current repository is authoritative. If starting from an empty repository, use this as the default:

```text
/
├── AGENTS.md
├── PROJECT_STATUS.md
├── README.md
├── index.html
├── assets/
│   ├── fonts/
│   ├── icons/
│   ├── images/
│   └── maps/
├── components/
│   └── component-name/
│       ├── component-name.html
│       ├── component-name.css
│       └── component-name.js
├── data/
│   └── countries/
│       └── country-slug/
│           ├── country.json
│           ├── budget.json
│           ├── itinerary.json
│           └── cuisine.json
├── docs/
├── pages/
│   └── country.html
├── scripts/
│   └── country-page.js
└── styles/
    ├── reset.css
    ├── tokens.css
    ├── typography.css
    └── global.css
```

Do not reorganize an established repository to match this example without approval.

## Run locally

Country and component data is loaded with `fetch()`, so do not open pages directly with `file://`.

Use the repository’s documented server command when one exists. If the project has no tooling, any simple static server is sufficient, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Stylesheet order

Load shared styles before page and component styles:

```html
<link rel="stylesheet" href="/styles/reset.css">
<link rel="stylesheet" href="/styles/tokens.css">
<link rel="stylesheet" href="/styles/typography.css">
<link rel="stylesheet" href="/styles/global.css">
```

Add page and component styles after these files.

## Adding a country

1. Create a country-slug directory under the established data path.
2. Add the country metadata and section JSON files required by the template.
3. Add images, maps, and icons under the established asset directories.
4. Use relative asset references consistent with existing country data.
5. Validate JSON syntax and required fields.
6. Serve the site locally and verify every populated section.
7. Test missing optional sections to ensure the page degrades gracefully.

See `docs/data-model.md` for the contracts.

## Adding or updating a component

1. Inspect the exact Figma node and existing component patterns.
2. Define the public data/configuration contract.
3. Implement semantic markup, scoped CSS, and focused JavaScript.
4. Test multiple content configurations and responsive widths.
5. Verify keyboard, focus, and reduced-motion behavior.
6. Update `docs/components.md` when the public contract changes.

## Completion checklist

- The result matches the supplied Figma node.
- No unrelated files changed.
- JSON parses and asset paths resolve.
- The console is free of new errors.
- Keyboard and focus behavior work.
- Mobile, tablet, laptop, and wide layouts were checked where relevant.
- Reduced-motion behavior was checked for animation.
- Documentation reflects structural or contract changes.

## Figma

Pareto Travel design file ID: `IBbYsd9B2ZHOq7NXfEUhtL`

Always use the exact node URL supplied with a task. A file ID alone does not identify the intended design state.
