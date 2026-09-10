# Sri Lanka editorial import

Source: https://app.notion.com/p/Teardrop-of-Joy-32c6869db21e80eea510f3a68542f949
Read 2026-09-10 through the connected Notion fetch tool. The returned content
ended normally and contained no unknown-block or truncation indicators.

Seven JSON files now live in `src/data/countries/sri-lanka/`. Overview,
itinerary, seasonal guidance, budget placeholders, and FAQ questions preserve
the source text and paragraph order. Notion escapes were decoded; italic
markup around “hot” was removed for the plain-text seasonal carousel.

Sri Lanka is published at `/countries/sri-lanka` following the user’s explicit
publication request. The generated entry, world-map link, and Destinations
link are included. SEO metadata was added for publication. Empty meals, budget,
and FAQ sections are omitted by the existing shared components.
The existing map asset is referenced. Visit year, ratings, map coordinates,
budget amounts and party size were not supplied. The five supplied `art-360`
SVGs are assigned to itinerary polaroids by their filename day numbers, at
360px and centered. The Day 3 artwork depicts Little Adam’s Peak, which the
source prose visits on Day 2; filename assignments and prose are preserved.
The dial now maps all twelve months from the supplied seasonal guidance for
the recommended south/west coast and central highlands itinerary: December–
February best, March–April good, and May–November avoid. This classification
interprets the source’s preferred cooler dry months, hotter dry months, and
rainy months; the regional north/east alternatives remain in the unchanged prose.

The five-day title agrees with five day entries. The itinerary supplies four
distinct taxi routes, recorded once each, and a “4-hour” Sigiriya–Ella duration.
Other durations remain absent. The separate transport and meals sections
have no editorial text. Budgets contain “…” and no arithmetic to check.
FAQ questions retain “[Country]” and have no answers.

The source also has an unsupported, unfinished section preserved here verbatim:

## City Guides
…

The statement “Colombo is the only way in or out of Sri Lanka” is absolute
and merits author review; it was preserved without fact-checking or correction.
Source grammar and spelling were left unchanged.

Verification: all imported passages were compared against the fetched source
in paragraph order; all repository JSON parsed; all seven new JSON documents
were fetched successfully over local HTTP; route uniqueness and place/leg
counts passed. Generation and `--check` passed for all three published countries.
Existing Bolivia and Cambodia generated HTML remained unchanged.
Browser tools were unavailable, so rendered line breaks, responsive layouts,
console/network behavior, and itinerary/FAQ interactions were not verified.
