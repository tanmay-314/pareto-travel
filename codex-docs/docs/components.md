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

### Annual dial

- Root: `[data-component="annual-dial"]`
- Inputs: ordered months, month rating/state, rotation duration
- Key behavior: rotating ring; month labels remain upright and separated from the ring
- Accessibility: textual month/state information must not depend on animation
- Motion: continuous motion may run by default; disable or simplify for reduced motion
- Implementation paths: _record when integrated_

### Budget receipt

- Root: `[data-component="budget-receipt"]`
- Inputs: country, number of days, number of people, currency, categories, amounts, total, notes
- Key behavior: render configurable receipt content without changing its Figma geometry
- Accessibility: use real text; announce totals in a logical reading order
- Implementation paths: _record when integrated_

### Polaroid itinerary

- Root: `[data-component="polaroid-itinerary"]`
- Inputs: ordered day entries, place, copy, image, image alt, rotation
- Key behavior: support itinerary-length and multi-place variants
- Image rule: photo and frame scale together; image region remains 1:1, typically authored at 360 × 360 px
- Placeholder rule: no teal placeholder unless explicitly requested
- Implementation paths: _record when integrated_

### Country navigation

- Root: `[data-component="country-navigation"]`
- Inputs: label, destination, rotation, current/active state
- Key behavior: each board is clickable and visibly highlighted on hover and focus
- Semantics: use anchors for navigation
- Implementation paths: _record when integrated_

### Cuisine/editorial section

- Root: `[data-component="cuisine-section"]` or the established repository selector
- Inputs: heading, editorial copy, image/artwork, captions, links, optional subsections
- Key behavior: preserve the Figma editorial composition while allowing realistic copy lengths
- Implementation paths: _record when integrated_

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
