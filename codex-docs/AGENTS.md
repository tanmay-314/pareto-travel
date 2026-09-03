# Pareto Travel — Codex Instructions

## Project purpose

Pareto Travel is an editorial travel website built from a Figma design system. Country pages combine reusable, data-driven components such as country maps, annual travel dials, budget receipts, polaroid itineraries, cuisine sections, and passport-stamp navigation.

The project should remain understandable to a developer learning frontend engineering. Prefer clear, conventional HTML, CSS, and JavaScript over abstractions that hide how the page works.

## Source of truth

- Treat the Pareto Travel Figma file as the visual source of truth: `IBbYsd9B2ZHOq7NXfEUhtL`.
- Keep the design sacrosanct. Do not reinterpret, modernize, simplify, or “improve” a supplied design unless explicitly asked.
- When a task includes a Figma node URL, inspect that exact node and its relevant component, variable, and asset context before implementing it.
- Match layout, spacing, sizing, typography, color, border treatment, rotation, layering, and responsive behavior as closely as the browser allows.
- Use exact exported SVGs or supplied image assets. Do not redraw detailed country maps or artwork approximately in CSS.
- Do not replace established project tokens or assets with visually similar values.

## Read order for every task

Before making changes, read the smallest relevant set in this order:

1. `AGENTS.md`
2. `PROJECT_STATUS.md`
3. `README.md`
4. `docs/architecture.md`
5. the task-specific guide in `docs/`
6. the files being changed and their nearest related components/data

If documentation and implementation disagree, do not silently choose one. Treat working code as evidence of current behavior, flag the inconsistency, and update the documentation as part of the change when the intended behavior is clear.

## Working principles

1. Inspect before editing. Read the relevant HTML, CSS, JavaScript, JSON, assets, and nearby documentation before proposing changes.
2. Preserve existing conventions. Extend the repository’s current organization instead of introducing a parallel architecture.
3. Make the smallest coherent change that fully solves the request.
4. Keep components reusable, portable, and independently understandable.
5. Keep content in data and presentation in components wherever practical.
6. Do not add frameworks, build tools, packages, or dependencies without explicit approval.
7. Do not silently change unrelated code or reformat unrelated files.
8. Never overwrite user changes merely to make implementation easier.

## Technology defaults

Unless the repository already establishes otherwise, use:

- semantic HTML5;
- modern, standards-based CSS;
- vanilla JavaScript using ES modules only when the current project supports them;
- JSON for country and component content;
- SVG or appropriately optimized raster files for visual assets.

Do not introduce React, Vue, Astro, Tailwind, TypeScript, Sass, a bundler, or a templating framework unless the user specifically requests it.

## Repository and file organization

First inspect the existing tree and follow it. For new work in an otherwise unstructured repository, prefer this shape:

```text
/
├── index.html
├── AGENTS.md
├── assets/
│   ├── images/
│   ├── maps/
│   ├── icons/
│   └── fonts/
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

This tree is a fallback, not permission to reorganize an established repository. Components may be kept together or split across existing `styles/`, `scripts/`, and `data/` directories when that is already the project convention.

### Stylesheet order

Load foundational styles in this order unless the existing project deliberately differs:

1. `reset.css`
2. `tokens.css`
3. `typography.css`
4. `global.css`
5. page styles
6. component styles

CSS and JavaScript files do not need to live in the same directory. Reference both with correct paths from HTML.

## Design tokens

- Use CSS custom properties from `tokens.css`; do not scatter raw design values through component files.
- Prefer semantic tokens in component CSS. Primitive tokens should mainly define the palette and scale.
- Preserve existing token names if present.
- Core known palette values include:
  - cream: `#FEFCF3`
  - plum: `#85586F`
  - soft plum: `#F0DBDB`
  - teal: `#588584`
- Add a new primitive and semantic alias when a genuinely new reusable value is required.
- Do not add a token for a one-off value unless it has a clear system-level meaning.

## Typography

- Use **Bitcount Grid Single** for established display and heading treatments.
- Use **Instrument Sans** for established body and interface text.
- Reuse typography classes or tokens from `typography.css` rather than redefining font rules per component.
- Preserve the Figma design’s casing, tracking, weight, line height, and decoration.
- Use responsive type scaling where the existing system expects it.
- Do not convert meaningful text into images.

## Component architecture

Each reusable component should have a clear public contract:

- semantic markup or a JavaScript render function;
- scoped CSS with a consistent component prefix;
- configuration supplied through JSON and/or documented `data-*` attributes;
- predictable initialization;
- graceful handling of optional fields;
- a usable fallback or explicit error state when required data is missing.

Prefer classes such as `.budget-receipt__total` over generic selectors such as `.total`. Avoid styling by element ID.

Do not embed demo-only setup in reusable component logic. If a demo is necessary, keep its markup minimal and ensure the component’s primary JavaScript file contains everything needed for production use.

When creating or changing a component:

1. Define its configurable inputs.
2. Keep content out of CSS.
3. Normalize and validate external data at the component boundary.
4. Render semantic HTML.
5. Scope styles to the component.
6. Document the mounting markup and expected data shape.
7. Test more than one data configuration when variants exist.

## Country-page data

- Use one reusable country-page template rather than duplicating a full HTML page for every country.
- Store content by country slug under the established country-data directory.
- Prefer stable, descriptive keys over keys tied to visual position.
- Use relative asset paths that work when served from the repository’s documented root.
- Keep schema or data-version metadata if the existing JSON uses it.
- Keep SEO metadata, country metadata, component content, asset references, and component settings distinct.
- Components may fetch their own focused JSON files or receive data from the country-page controller; follow the existing pattern consistently.
- Do not duplicate the same fact in multiple JSON files unless the project documents which copy is authoritative.

Example principles—not a mandatory schema:

```json
{
  "schemaVersion": 1,
  "slug": "mexico",
  "status": "published",
  "country": {},
  "seo": {},
  "assets": {},
  "sections": {}
}
```

JSON loaded with `fetch()` must be tested through a local or production web server, not by opening the HTML file directly with `file://`.

## Known component behavior

Preserve these established expectations when working on the relevant components:

- **Annual dial:** the ring may rotate continuously, but all month labels remain upright at zero degrees and maintain clear distance from the rotating ring. Respect `prefers-reduced-motion`.
- **Polaroid itinerary:** the inserted photo and polaroid frame scale together at 1:1. The intended photo insert is square, typically `360 × 360` px. Do not add a teal placeholder unless explicitly requested.
- **Budget receipt:** country name, trip duration, traveller count, categories, amounts, currency, and totals should remain configurable. Preserve the receipt design exactly.
- **Country navigation:** each passport stamp is a semantic link, supports label, country name, year, and -5° to 5° rotation configuration, is keyboard accessible, and has a visible hover/focus treatment.
- **Country maps and dot art:** use supplied/exported vector assets and preserve the established dotted visual language. Do not hand-author thousands of SVG path or ellipse lines inside HTML when an external SVG asset can be referenced.

## HTML rules

- Use landmarks such as `header`, `nav`, `main`, `section`, `article`, and `footer` appropriately.
- Preserve a logical heading hierarchy.
- Use anchors for navigation and buttons for actions.
- Provide meaningful `alt` text for informative images and empty `alt=""` for decorative images.
- Include width and height attributes on images when known to reduce layout shift.
- Keep JavaScript in external files unless a tiny inline bootstrapping snippet is already an intentional repository convention.
- Load styles with `<link rel="stylesheet" href="…">` and scripts with `<script src="…" defer></script>` or the established module equivalent.

## CSS rules

- Build mobile-first unless the current component is explicitly anchored to a fixed editorial canvas.
- Use logical properties where they improve internationalization and readability.
- Prefer Grid and Flexbox over absolute positioning for page structure.
- Use absolute positioning when it is intrinsic to the Figma composition, such as layered artwork or deliberately rotated passport stamps.
- Avoid `!important` unless overriding an unavoidable third-party or legacy rule; explain any use in a comment.
- Avoid broad global selectors in component styles.
- Preserve visible focus styles.
- Support `prefers-reduced-motion: reduce` for animation and smooth scrolling.
- Check for overflow and text collisions at narrow widths and with longer content.

## JavaScript rules

- Keep functions small and name them by intent.
- Prefer progressive enhancement: core content and navigation should remain understandable if JavaScript fails whenever feasible.
- Query within a component root rather than the entire document when multiple instances may exist.
- Allow safe repeated initialization or explicitly guard against double mounting.
- Check `response.ok` before parsing fetched JSON.
- Surface actionable errors in development; do not fail silently.
- Do not use `innerHTML` with untrusted content. Prefer DOM construction and `textContent`.
- Do not attach values to `window` unless an existing integration requires it.
- Clean up timers and listeners when a component exposes a destroy lifecycle.

## Accessibility

Accessibility is part of design fidelity, not an optional enhancement.

- Ensure all interactive controls are keyboard operable.
- Preserve visible `:focus-visible` outlines.
- Include a skip link on full pages.
- Use the existing visually-hidden utility for accessible labels where needed.
- Give sections appropriate `scroll-margin` when linked from in-page navigation.
- Use ARIA only when native HTML cannot express the behavior.
- Do not rely on color alone to communicate an interactive or selected state.
- Confirm text/background contrast, especially for soft plum and cream combinations.

## Responsive behavior

- Derive breakpoints from where the design actually stops working, while preserving any established project breakpoints.
- Verify at representative mobile, tablet, laptop, and wide-desktop widths.
- Keep editorial compositions visually intentional rather than merely stacking every element.
- Preserve square artwork with `aspect-ratio: 1 / 1` where applicable.
- Avoid fixed heights for text-containing regions unless required by the design and tested with realistic content.

## Verification

Before reporting a task complete:

1. Review the diff and confirm only intended files changed.
2. Run the repository’s existing formatter, linter, and tests where available.
3. Serve the site locally when the change uses `fetch()` or routing.
4. Check the browser console for errors.
5. Verify the changed component at relevant viewport sizes.
6. Test keyboard navigation and focus states.
7. Test reduced-motion behavior for animated components.
8. Compare the rendered result against the exact Figma node when one was supplied.
9. Report what changed, what was verified, and any remaining mismatch or assumption.

Do not claim pixel-perfect parity unless a rendered comparison was actually performed.

## Documentation upkeep

Update documentation in the same change when you alter:

- repository structure or runtime flow → `docs/architecture.md`;
- tokens, typography, or shared visual rules → `docs/design-system.md`;
- JSON fields or data ownership → `docs/data-model.md`;
- a reusable component contract → `docs/components.md`;
- Figma implementation practice → `docs/figma-workflow.md`;
- setup, local serving, validation, or deployment commands → `README.md` or `docs/development.md`;
- an architectural decision with meaningful alternatives → `docs/decisions.md`;
- current priorities, known gaps, or active work → `PROJECT_STATUS.md`.

## Communication style

The user is learning frontend development while building this project.

- Lead with the outcome.
- Explain file responsibilities and how files interact when introducing or restructuring code.
- Use plain language, but include the technical reason behind important decisions.
- Call out assumptions and trade-offs before making a choice that affects architecture.
- When a task is underspecified, inspect the repository first. Ask a question only when different answers would materially change the implementation.
- Provide exact file paths and concise run/test instructions in the final handoff.

## Change boundaries

Ask before:

- adding or changing a dependency;
- changing the framework or build system;
- moving or renaming many files;
- changing the public JSON schema incompatibly;
- replacing supplied design assets;
- altering established design tokens;
- making a visual departure from Figma;
- deleting files or removing behavior beyond the requested scope.

Safe, localized fixes that preserve the public interface do not require additional confirmation.
