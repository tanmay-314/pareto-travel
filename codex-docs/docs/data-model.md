# Data Model

## Goals

Country data should make it possible to render many country pages from one reusable template without mixing content into component code.

The model should be:

- readable by a human editor;
- stable across countries;
- explicit about optional content;
- safe to normalize and validate;
- independent of exact visual positioning.

## Organization

Prefer a directory per country with consistent filenames:

```text
data/countries/
├── mexico/
│   ├── country.json
│   ├── budget.json
│   ├── itinerary.json
│   └── cuisine.json
└── peru/
    ├── country.json
    ├── budget.json
    ├── itinerary.json
    └── cuisine.json
```

The same nested filenames across countries make loading, validation, and maintenance predictable. Omit an optional file only when the loader explicitly supports that absence.

If the repository already uses one consolidated `country.json` per country, retain that approach and group content under stable section keys. Do not mix both strategies without documenting the boundary.

## Shared country metadata

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "slug": "mexico",
  "status": "published",
  "country": {
    "name": "Mexico",
    "shortDescription": "",
    "region": "North America"
  },
  "seo": {
    "title": "",
    "description": ""
  },
  "assets": {
    "map": "/assets/maps/mexico.svg",
    "hero": "/assets/images/mexico/hero.webp"
  },
  "sections": {
    "annualDial": true,
    "budget": true,
    "itinerary": true,
    "cuisine": true
  }
}
```

This is guidance, not a mandate to replace a working schema.

## Field rules

- Use `camelCase` for JSON keys unless the repository already standardizes another convention.
- Use lowercase kebab-case for slugs and asset filenames.
- Use numbers for numeric values, not formatted strings.
- Store currency separately from amounts.
- Store machine-readable dates in ISO 8601 form.
- Store display labels only when editorial wording is intentional or localization requires it.
- Use arrays when order matters.
- Use stable IDs for items that can be linked, selected, or updated independently.
- Distinguish `null`, an empty array, and a missing field intentionally.

## Country hero

The country hero uses a focused `country.json` file alongside the other country
section data:

```json
{
  "schemaVersion": 1,
  "slug": "cambodia",
  "status": "published",
  "name": "Cambodia",
  "visitedYear": 2025,
  "seo": {
    "title": "Cambodia travel guide | Pareto Travel",
    "description": "A concise search and social description."
  },
  "subtitle": "Wat and Peace",
  "overview": "Country overview copy.",
  "map": {
    "src": "../../../assets/countries/cambodia/country-map.svg",
    "alt": "Map of Cambodia"
  }
}
```

`slug`, `status`, `name`, `seo.title`, `seo.description`,
`overview`, `map.src`, and `map.alt` are required for a generated public page.
The slug must match its data-directory name and use lowercase kebab-case. Only
`published` documents receive an entry page. `visitedYear` is optional; when
provided it must be an integer, and when absent the navigation omits the year.
Map paths are resolved relative to
`country.json` and must point to a same-origin asset.

## Country rating

Country ratings live in the top-level `ratings` array in `country.json` and are
rendered in the FAQ section's `{COUNTRY} REVIEW` quick-reference card. Keeping
them with shared country data lets the card derive its title and rating values
from one canonical source. The array contains exactly six ordered parameters:
Culture, Nature, Adventure, Cities, Food, and Safety. Each uses `great`,
`good`, or `not-great`:

```json
{
  "ratings": [
    {
      "id": "culture",
      "rating": "great"
    },
    {
      "id": "nature",
      "rating": "good"
    }
  ]
}
```

Keep the parameter order consistent across countries so comparisons remain
predictable. IDs use lowercase kebab-case; display labels come from the fixed
parameter definitions in the component.

## Budget receipt

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "days": 7,
  "people": 2,
  "year": 2026,
  "lineItems": [
    {
      "description": "STAYS · 7 NIGHTS",
      "value": "$700"
    }
  ],
  "total": "$700",
  "editorial": [
    "A short explanation of what the estimate covers."
  ]
}
```

The current receipt presents five ordered line items and an authored, formatted
total. Include the currency symbol in each displayed value. Editorial copy is
stored as an ordered paragraph array and appears beside the receipt on desktop.
Optional `categories` entries have `title` and `editorial` paragraph arrays;
when present, they enable an overview-plus-categories carousel. Cambodia has
five categories plus an `alternatives` array of title/editorial objects.
Alternatives render together on a final screen with bold subheadings, giving
seven screens and seven tracking dots.

## Annual dial

The runtime reads `{ "countries": { "<slug>": { ... } } }` from
`best-months.json`. A country supplies `country` and `months`, keyed `jan` through `dec` with `best`, `good`, or `avoid` values.

`editorial` is a string array. Optional `seasons` is an ordered array of
`{ "title": "November to February", "editorial": ["..."] }` objects.
When seasons are present, editorial becomes the overview screen followed by
one screen per season. Without seasons, the existing paragraph renderer
supports `**bold**` and `*italic*` emphasis. Carousel paragraphs are plain text.

## Polaroid itinerary

The runtime reads `{ "itineraries": [...] }`. Each itinerary has `id`,
`country`, `title`, an overview `editorial` string array, optional zero-based
`editorialHeadings` indexes for bold overview headings, optional `detailLink`,
and an ordered `days` array. Each day supplies `dayNumber`, `location`,
`rotation` (a supported degree string), and `image` (`src`, `alt`, `position`,
`size`). Photo and frame scale together; the photo region is square.

Days may additionally supply `title` and an `editorial` paragraph array.
Providing day editorials enables the text carousel: overview first, then one
screen per day. The optional title defaults to the day number and location.
Legacy itineraries without day editorials still render overview paragraphs
and the detail link. The carousel replaces that link with in-place navigation.
Cambodia uses three screens: Overview, Day 1 – Siem Reap, Day 2 – Angkor Wat.

## Inter-city travel

Ticket location names display in uppercase. By default, author one ticket per
route: omit repeated and reverse-direction legs unless explicitly requested.
For example, Bolivia lists Santa Cruz → Sucre and Sucre → Uyuni, without return
tickets. Keep return-trip details in the editorial when supplied by the source.

Provide ordered `places` (objects with `name`) and one or more `legs` with
`mode`, `duration`, and an optional `recommended` flag. There must be exactly
one more place than legs. Optional `title`, `editorial`, and `assets` configure
the section heading, paragraphs, and ticket/mode images.

A leg may include an `editorial` string array and optional `title`. When at
least one leg has editorial content, the section renders a carousel: the
top-level `editorial` is the overview, followed by each leg with copy. Leg
headings default to “Origin to Destination”. Existing data with no leg copy
retains its plain paragraph rendering. Tickets still display route details only.

For an itinerary with no inter-city travel, keep the same shape:

```json
{
  "places": [{ "name": "NO TICKET" }, { "name": "REQUIRED" }],
  "legs": [{ "mode": "none", "message": "ENJOY!" }]
}
```

`mode: "none"` selects the smiley icon and displays the optional `message`
instead of transport mode/duration. The message defaults to empty when omitted;
other modes retain their normal mode/duration row. Override the smiley path
with `assets.modes.none` when needed.

## Country navigation

Illustrative shape:

```json
{
  "schemaVersion": 2,
  "countryName": "CAMBODIA",
  "year": "2025",
  "stamps": [
    {
      "label": "CUISINE",
      "target": "#cuisine",
      "rotation": -5,
      "x": 410.71,
      "y": 7.68
    }
  ]
}
```

`width` and `height` define the group coordinate space. Each stamp's `x` and
`y` locate its unrotated 180 × 84px base inside that space. Rotation must be
between -5 and 5 degrees. The whole group scales from the live country map's
720px Figma baseline, keeping each 180px-wide stamp at a 1:4 ratio with the
map and scaling its nested text and artwork at the same rate. Use an anchor
when the item navigates; do not model it as a click handler without an `href`.

## Cuisine

Illustrative shape:

```json
{
  "title": "CUISINE",
  "chapters": [
    {
      "period": "BREAKFAST",
      "icon": "../assets/components/cuisine/icon-morning.svg",
      "dish": "Nom banh chok",
      "description": "Cool rice noodles, green fish curry and herbs."
    }
  ],
  "editorial": [
    "A short introduction to the country’s food culture."
  ],
  "detailLink": {
    "label": "Read the full cuisine guide",
    "href": "#cuisine"
  }
}
```

`chapters` is capped at three by the current composition. `detailLink` is optional. Older data may use `lede` and `paretoPick.copy`; the component treats those values as editorial fallback copy.

## Asset references

- Prefer paths rooted consistently from the served site root.
- Keep asset filenames descriptive and stable.
- Do not embed base64 image data in JSON.
- Keep `alt` text next to the image reference when it is content-specific.
- Avoid storing CSS declarations such as transforms or colors in JSON. Store constrained values such as `rotationDegrees`, theme names, or semantic variants instead.

## Validation and normalization

At every component boundary:

1. Confirm required objects and arrays exist.
2. Coerce only safe, unambiguous values.
3. Apply documented defaults for optional fields.
4. Reject or clearly report malformed required fields.
5. Never render raw external strings as HTML.

If formal schema validation is later introduced, place versioned schemas in a dedicated directory and record the decision in `decisions.md`.

## Schema changes

For a breaking change:

1. explain why the existing shape is insufficient;
2. identify every consumer;
3. provide a migration for existing country data;
4. increment the relevant schema version;
5. update examples and component documentation;
6. test at least two countries and all affected optional states.

## Incomplete published guides

A country may be published before every section is complete. Keep all section
JSON files, but leave unknown content absent rather than copying demo values.
The page omits cuisine with no chapters/editorial, budgets with no line items,
and FAQs with neither answered questions nor ratings. Unanswered FAQ items are
not displayed. Navigation loads after sections and excludes removed targets.
Seasonal editorials render independently of the dial; the dial stays hidden
until all twelve month states are supplied. Invalid
supplied dial states still fail validation. Itinerary images remain optional.
