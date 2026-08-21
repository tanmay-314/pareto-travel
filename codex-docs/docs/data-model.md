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
  "name": "Cambodia",
  "subtitle": "Wat and Peace",
  "overview": "Country overview copy.",
  "map": {
    "src": "../../../assets/countries/cambodia/country-map.svg",
    "alt": "Map of Cambodia"
  }
}
```

`name`, `subtitle`, `overview`, `map.src`, and `map.alt` are required. Map paths
are resolved relative to `country.json` and must point to a same-origin asset.

## Budget receipt

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "countryName": "Mexico",
  "days": 7,
  "people": 2,
  "currency": "INR",
  "categories": [
    {
      "id": "accommodation",
      "label": "Accommodation",
      "amount": 0
    }
  ],
  "total": 0,
  "notes": []
}
```

Decide whether `total` is authored or calculated and document one source of truth. If calculated, do not trust a duplicated authored total.

## Annual dial

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "rotationDurationSeconds": 60,
  "months": [
    {
      "id": "jan",
      "label": "JAN",
      "rating": "recommended"
    }
  ]
}
```

Month ordering is meaningful. Validate that all required months appear once when the design requires a full year.

## Polaroid itinerary

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "days": [
    {
      "id": "day-1",
      "dayNumber": 1,
      "place": "Kyoto",
      "title": "",
      "summary": "",
      "image": {
        "src": "/assets/images/japan/day-1.webp",
        "alt": ""
      },
      "rotationDegrees": -2
    }
  ]
}
```

Images should be square or safely crop to the component’s 1:1 image region. Rotation is configuration, not content embedded in CSS selectors.

## Country navigation

Illustrative shape:

```json
{
  "schemaVersion": 1,
  "items": [
    {
      "id": "cuisine",
      "label": "Cuisine",
      "href": "#cuisine",
      "rotationDegrees": -3
    }
  ]
}
```

Use an anchor when the item navigates. Do not model it as a click handler without an `href`.

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
