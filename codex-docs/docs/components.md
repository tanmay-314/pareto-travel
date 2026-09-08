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
- Inputs: exactly six ordered rating objects for Culture, Nature, Adventure, Cities, Food, and Safety
- Rating states: `great`, `good`, and `not-great`, rendered with the primary, secondary, and tertiary icon color tokens respectively
- Mounting: the FAQ review renders it directly from `country.json`; standalone usage can set `data-source` on `[data-country-rating]`
- Accessibility: each magnet exposes a text equivalent such as “Nature: good”
- Responsive behavior: the Figma 540 × 360 three-by-two layout (node `1482:12614`) uses 150px magnets, 45px column gaps, and 60px row gaps; its width stays at `3:4` of the live country-map width and remains constrained by its container
- Fallback: invalid or unavailable data hides only the rating block and logs an actionable error
- Implementation paths: `src/scripts/components/country-rating.js`, `src/styles/components/country-rating.css`, `src/assets/components/country-rating/`, `src/assets/icons/`, and `src/data/countries/<slug>/country.json`

### FAQ review

- Root: `[data-faqs]`, with `data-source` for FAQ content and `data-country-source` for the country name and ratings
- Inputs: `sectionTitle`, `allowMultiple`, and ordered FAQ `items` from `faqs.json`; `name` and `ratings` come from `country.json`
- Key behavior: FAQs render in the left column and the transparent, title-free country-rating graphic renders in the right column
- Data ownership: the country name and rating values remain canonical in `country.json` and are not duplicated in FAQ data
- Implementation paths: `src/scripts/components/faqs.js`, `src/styles/components/faqs.css`, and `src/data/countries/<slug>/{faqs,country}.json`

### Best months and annual dial

- Roots: `.annual-travel-dial[data-country]` and `[data-best-months-editorial]`.
- Inputs: country name, center label/value, twelve month states, overview `editorial`, and optional `seasons` entries with `title` and `editorial` paragraphs.
- Editorial: overview plus one screen per season; Cambodia has four screens. The shared carousel handles bounded arrows, Left/Right and Home/End keys, swipes, live announcements, inert hidden screens, and map-relative controls. The text grid is at least 420px tall and grows to its longest screen to keep headings visible and avoid clipping or height jumps.
- Legacy paragraph arrays without seasons retain formatted bold/italic text rendering.
- Dial: the existing compass oscillates around the best season; labels stay upright. Reduced motion stops the compass and suppresses carousel fades.
- Implementation: `src/scripts/components/best-months.js`, `src/styles/components/best-months.css`, and `src/data/countries/<slug>/best-months.json`.

### Shared editorial carousel

- Implementation: `src/scripts/components/editorial-carousel.js` and `src/styles/components/editorial-carousel.css`; itinerary, best months, budget, and inter-city travel use it.
- `renderEditorialCarousel(root, screens, options)` accepts screens with `label`, optional `title`, `editorial` paragraphs and optional heading indexes. Options set accessible labels, a component class alias, and an `onSelect(index)` callback. The returned `select(index, notify)` supports synchronization without feedback loops.
- Controls reuse the supplied arrow assets and equal 6px Figma dots, scaling with country-map width / 720. Arrows remain 1:24 of map width; 4px gaps between 8px slots place dot centers 12px apart at the Figma baseline. Pagination width is `12 × screen count × map width / 720`.
- Re-rendering disconnects the previous resize observer and replaces event-owning DOM. Call `destroyEditorialCarousel(root)` before rendering a non-carousel fallback.

### Budget receipt

- Root: `[data-budget-receipt]`
- Inputs: number of days, number of people, year, five ordered line items, total, an overview `editorial` paragraph array, and optional `categories` with `title` and `editorial` paragraphs.
- Key behavior: render configurable receipt content in the fixed `420 × 540px` receipt geometry, keep its width at `7:12` of the live country-map width, and align its editorial with the shared country-section grid
- Editorial carousel: overview followed by each category and an optional combined alternatives screen; Cambodia has seven screens. The final screen uses bold body-font subheadings and the shared 18px editorial body size. The shared controls provide bounded arrows, keyboard and swipe navigation, equal dots with scaled 4px slot gaps, and map-relative sizing. The content grid matches best months at a minimum of 420px and grows to the longest screen. Without categories, legacy editorial paragraphs render as before.
- Accessibility: use real text; announce totals in a logical reading order
- Implementation paths: `src/scripts/components/budget.js`, `src/styles/components/budget.css`, `src/assets/components/budget/`, and `src/data/countries/<slug>/budget.json`

### Polaroid itinerary

- Editorial carousel: when days include `editorial` arrays, `#itinerary-editorial` renders overview plus one screen per day, using the supplied arrows and exported Figma pagination dots. Previous/next navigation stops at the ends; Left/Right, Home/End, and horizontal swipes navigate. Hidden slides are inert; screen changes are announced. All screens share a content-sized grid row (at least 420px, matching best months and budget) to avoid clipping or height jumps; reduced motion disables the fade. Re-rendering replaces the carousel and its listeners. Legacy itineraries without day editorials retain their paragraph/link rendering.
- Root: `[data-itinerary]` (the country page currently mounts it at `#polaroid-list`)
- Inputs: ordered day entries, place, copy, image, image alt, rotation
- Key behavior: the complete deck is centered in its visual viewport; it deals in once on first viewport entry; hover previews exposed cards; click, tap, or keyboard selection promotes a day to the front and updates its visible `DAY X OF Y` label
- Carousel control sizing: a resize observer scales controls from the live country-map width / 720. Each arrow is map width / 24. Pagination retains 8 × 12px dot slots, 6px active and inactive ellipses, 4px gaps between slots, and 1px/3px outer padding at the Figma baseline; total width is `12 × screen count × map width / 720`. Arrow buttons retain a minimum 44px height for interaction. The observer is cleaned up on re-render.
- Day linking: clicking or keyboard-activating a polaroid opens its corresponding editorial screen, including when the card is already at the front. Deck keyboard and swipe selection also open the selected day. Carousel arrows, keyboard navigation, and swipes also bring the corresponding day card to the front without moving keyboard focus away from the carousel. Rapid carousel navigation retains the latest day while a shuffle finishes. The overview remains the initial screen and preserves the current front card when revisited. `renderItinerary(target, days, onSelectDay)` optionally reports the zero-based selected day to the page composition.
- Keyboard and touch: the active card is in the tab order; arrow keys, Home, and End select days; horizontal swipes select adjacent days on touch screens
- Motion: shuffle animations use only transforms and opacity; reduced-motion users receive a short crossfade instead of spatial motion
- Image rule: photo and frame scale together; image region remains 1:1, typically authored at 360 × 360 px
- Placeholder rule: no teal placeholder unless explicitly requested
- Implementation paths: `src/scripts/components/itinerary.js`, `src/styles/components/itinerary.css`, and `src/data/countries/<slug>/itinerary.json`

### Country navigation

- Root: `[data-country-navigation]`
- Inputs: country name and visit year assigned by the country-page controller;
  shared stamp labels, destinations, and rotations from -5° to 5° loaded from
  `country-navigation.json`
- Key behavior: the six passport stamps render as a 3 × 2 group inside the country hero; each stamp is clickable and visibly highlighted on hover and focus
- Semantics: use anchors for navigation
- Responsive behavior: the group scales from the live country-map width using the shared 720px Figma baseline; each 180 × 84px stamp is therefore exactly one quarter of the map width, with all nested decoration and text scaling together
- Implementation paths: `src/scripts/components/country-navigation.js`, `src/styles/components/country-navigation.css`, `src/data/components/country-navigation.json`, and `src/assets/components/country-navigation/`

### Cuisine/editorial section

- Root: `[data-cuisine-component]`
- Inputs: `title`, up to three `chapters`, an `editorial` paragraph array, and an optional `detailLink`
- Key behavior: render the three dishes inside the `420 × 540px` cuisine menu artefact, keep its width at `7:12` of the live country-map width, pair it with editorial copy on desktop, and collapse to one column below `900px`
- Compatibility: legacy `lede` and `paretoPick.copy` values are used when `editorial` is absent
- Implementation paths: `src/scripts/components/cuisine.js`, `src/styles/components/cuisine.css`, and `src/data/countries/<slug>/cuisine.json`

### Inter-city travel

- Root: `[data-inter-city-travel]`
- Inputs: one or more ordered `legs` with mode, duration, and an optional `recommended` flag; exactly one more ordered `places` than legs; optional `title` and `editorial`; and ticket/mode asset paths
- Editorial carousel: legs with an `editorial` paragraph array contribute one screen after the overview. Bolivia has three screens: Overview, Santa Cruz to Sucre, and Sucre to Uyuni. Optional leg `title` overrides the route-derived heading. Shared controls provide arrows, keyboard and swipe navigation, three tracking dots, and map-relative scaling. A 420px minimum text height grows to the longest screen; repeated rendering cleans up the old carousel observer. Legacy data without leg editorials keeps its paragraph layout.
- Ticket content: show only the origin, destination, transport icon, combined mode/duration, and optional Pareto Pick label; do not render body copy inside a ticket
- No-travel variant (Figma `1530:52750`): use `places` names `NO TICKET` and `REQUIRED` with one leg containing `mode: "none"` and `message: "ENJOY!"`. The mode uses `icon-smiley.svg` (overridable through `assets.modes.none`) and the message replaces mode/duration in the lower row.
- Key behavior: render one ticket per journey leg in the `540px`-wide Figma composition, size the stack to the rendered ticket count, and alternate even-numbered tickets into the staggered position
- Responsive behavior: keep the stack at `3:4` of the live country-map width, constrain it to its grid column, use equal columns below `1500px`, and collapse to one column below `900px`
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

### Partial country content

Country navigation initializes after section loading and only includes existing
section targets. Its year is optional. Cuisine, budget, and FAQ loaders omit
unfinished sections (see `data-model.md`); FAQ ratings are optional. Best-months
editorials remain visible when the dial lacks complete month/center settings.
