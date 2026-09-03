# Component Guide

## Purpose

This document defines how reusable Pareto Travel components are structured and integrated. Add a short contract entry here whenever a new shared component is introduced.

## Standard component contract

A component should define:

- its root selector;
- required and optional data;
- supported variants;
- mounting method;
- emitted or handled events;
- accessible name and keyboard behavior;
- motion behavior;
- responsive behavior;
- fallback and error behavior.

## Recommended file shape

```text
components/component-name/
├── component-name.html
├── component-name.css
└── component-name.js
```

The HTML file may be a documented integration fragment rather than a runtime include. Do not assume browsers import arbitrary HTML partials without an established loader.

## Mounting pattern

Prefer a root element with explicit configuration:

```html
<section
  class="annual-dial"
  data-component="annual-dial"
  data-source="/data/countries/mexico/annual-dial.json"
  aria-labelledby="annual-dial-title"
>
  <h2 id="annual-dial-title">Best months to visit</h2>
</section>
```

The component script should initialize only matching roots and should query descendants relative to each root.

## JavaScript responsibilities

A typical module may expose:

```js
export function mountComponent(root, input) {
  // Normalize, render, bind, and return optional cleanup.
}
```

If the project does not use modules, follow its established pattern while keeping the same separation of responsibilities.

Do not split required production behavior between a component script and an undocumented demo script.

## CSS responsibilities

- Prefix public classes with the component name.
- Keep layout dependencies inside the component root.
- Consume shared semantic tokens.
- Avoid styling arbitrary descendants by tag alone.
- Do not require a particular parent page unless documented.
- Keep state names explicit, such as `.is-active` or `[aria-current="page"]`.

## Component registry

Update the paths below when components are integrated.

### Country hero

- Root: `[data-country-hero]`
- Inputs: country name, subtitle, overview, map asset path, and map alternative text
- Mounting: set `data-source` to the country's `country.json`; the component preserves the HTML fallback if loading or validation fails
- Accessibility: the country name remains the page `h1`; the map is exposed as an image using its configured alternative text
- Implementation paths: `src/scripts/components/country-hero.js`, `src/styles/components/country-intro.css`, and `src/data/countries/<slug>/country.json`

### Country rating

- Root: `.country-rating` for direct rendering or `[data-country-rating]` for standalone mounting
- Inputs: exactly five ordered rating objects with `id`, `label`, and numeric `score`
- Score scale: `0`–`5` in half-star increments; full, partial, and tertiary stars are rendered from exported Figma assets
- Mounting: the FAQ review renders it directly from `country.json`; standalone usage can set `data-source` on `[data-country-rating]`
- Accessibility: each row is a description-list pair and exposes a text equivalent such as “Nature: 3.5 out of 5 stars”
- Responsive behavior: each star tracks the live country-map width at a 1:24 ratio (30 px at the map's 720 px maximum); the five-star strip updates through `ResizeObserver`
- Fallback: invalid or unavailable data hides only the rating block and logs an actionable error
- Implementation paths: `src/scripts/components/country-rating.js`, `src/styles/components/country-rating.css`, `src/assets/components/country-rating/`, and `src/data/countries/<slug>/country.json`

### FAQ review

- Root: `[data-faqs]`, with `data-source` for FAQ content and `data-country-source` for the country name and ratings
- Inputs: `sectionTitle`, `allowMultiple`, and ordered FAQ `items` from `faqs.json`; `name` and `ratings` come from `country.json`
- Key behavior: the quick-reference column renders `{COUNTRY} REVIEW` followed by the reusable country-rating component
- Data ownership: the country name and rating values remain canonical in `country.json` and are not duplicated in FAQ data
- Implementation paths: `src/scripts/components/faqs.js`, `src/styles/components/faqs.css`, and `src/data/countries/<slug>/{faqs,country}.json`

### Annual dial

- Root: `[data-component="annual-dial"]`
- Inputs: ordered months, month rating/state, rotation duration
- Key behavior: rotating ring; month labels remain upright and separated from the ring
- Accessibility: textual month/state information must not depend on animation
- Motion: continuous motion may run by default; disable or simplify for reduced motion
- Implementation paths: _record when integrated_

### Budget receipt

- Root: `[data-budget-receipt]`
- Inputs: number of days, number of people, year, five ordered line items, total, and an `editorial` paragraph array
- Key behavior: render configurable receipt content in the fixed `420 × 540px` receipt geometry, keep its width at `7:12` of the live country-map width, and align its editorial with the shared country-section grid
- Accessibility: use real text; announce totals in a logical reading order
- Implementation paths: `src/scripts/components/budget.js`, `src/styles/components/budget.css`, `src/assets/components/budget/`, and `src/data/countries/<slug>/budget.json`

### Polaroid itinerary

- Root: `.polaroid-list` (the country page currently mounts it at `#polaroid-list`)
- Inputs: ordered day entries, place, copy, image, image alt, rotation
- Key behavior: the complete deck is centered in its visual viewport; it deals in once on first viewport entry; hover previews exposed cards; click, tap, or keyboard selection promotes a day to the front and updates its visible `DAY X OF Y` label
- Keyboard and touch: the active card is in the tab order; arrow keys, Home, and End select days; horizontal swipes select adjacent days on touch screens
- Motion: shuffle animations use only transforms and opacity; reduced-motion users receive a short crossfade instead of spatial motion
- Image rule: photo and frame scale together; image region remains 1:1, typically authored at 360 × 360 px
- Placeholder rule: no teal placeholder unless explicitly requested
- Implementation paths: `src/scripts/components/itinerary.js`, `src/styles/components/itinerary.css`, and `src/data/countries/<slug>/itinerary.json`

### Country navigation

- Root: `[data-component="country-navigation"]`
- Inputs: country name, year, stamp label, destination, rotation from -5° to 5°, and current/active state
- Key behavior: the six passport stamps render as a 3 × 2 group inside the country hero; each stamp is clickable and visibly highlighted on hover and focus
- Semantics: use anchors for navigation
- Responsive behavior: the group scales from the live country-map width using the shared 720px Figma baseline; each 180 × 84px stamp is therefore exactly one quarter of the map width, with all nested decoration and text scaling together
- Implementation paths: `src/scripts/components/country-navigation.js`, `src/styles/components/country-navigation.css`, `src/data/components/country-navigation.json`, and `src/assets/components/country-navigation/`

### Cuisine/editorial section

- Root: `[data-cuisine-component]`
- Inputs: `title`, up to three `chapters`, an `editorial` paragraph array, and an optional `detailLink`
- Key behavior: render the three dishes inside the `540 × 600px` cuisine menu artefact, scale the full artefact to `3:4` of the live country-map width, pair it with editorial copy on desktop, and collapse to one column below `900px`
- Compatibility: legacy `lede` and `paretoPick.copy` values are used when `editorial` is absent
- Implementation paths: `src/scripts/components/cuisine.js`, `src/styles/components/cuisine.css`, and `src/data/countries/<slug>/cuisine.json`

### Inter-city travel

- Root: `[data-inter-city-travel]`
- Inputs: one or more ordered `legs`, exactly one more ordered `places` than legs, optional `title` and `editorial`, and ticket/mode asset paths
- Key behavior: render one ticket per journey leg, size the stack to the rendered ticket count, and alternate even-numbered tickets into the staggered position
- Responsive behavior: scale the complete ticket stack when its frame is narrower than the fixed ticket composition
- Fallback: reject empty journey lists or a place/leg count mismatch with an actionable component error
- Implementation paths: `src/scripts/components/inter-city-travel.js`, `src/styles/components/inter-city-travel.css`, `src/assets/components/inter-city-travel/`, and `src/data/countries/<slug>/inter-city-travel.json`

### Country map and dot artwork

- Root: component-specific or decorative asset container
- Inputs: external SVG/image path, accessible label when informative
- Key behavior: preserve approved dot geometry and palette
- Asset rule: reference external SVG rather than embedding thousands of elements in HTML
- Implementation paths: _record when integrated_

## Adding a component

1. Inspect the Figma component and all relevant variants/properties.
2. Search the codebase for similar markup, tokens, utilities, and behavior.
3. Write down the component contract before implementation.
4. Create semantic mounting markup.
5. Implement scoped styles and responsive states.
6. Implement data normalization and interaction behavior.
7. Test multiple instances when applicable.
8. Test long content, missing optional fields, and invalid required data.
9. Test keyboard and reduced-motion behavior.
10. Add the component to this registry with real file paths.

## Changing a public contract

Treat selectors, data keys, `data-*` attributes, exported functions, events, and expected asset shapes as public interfaces. Preserve compatibility where practical. If a breaking change is necessary, update every usage and document the migration in the same change.
