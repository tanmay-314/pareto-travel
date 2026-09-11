# Country editorial import — 11 September 2026

Source index: https://app.notion.com/p/6b1319ac2c834f048cccfea29357c7e0

Imported all 15 substantive country drafts. The user explicitly requested publication of the 12 new countries; Cambodia, Bolivia, and Sri Lanka retain their published status. No deployment or Notion changes were made.

## Sources

- united-states: https://app.notion.com/p/59deef92a10f42bfb7979cc44e5c81f2
- turkey: https://app.notion.com/p/3b96869db21e8027b23ad23bc44547be
- greece: https://app.notion.com/p/3b96869db21e8087a1a4e14264f26a75
- iceland: https://app.notion.com/p/3b96869db21e806b82fdd848ca1a63ee
- peru: https://app.notion.com/p/df8d90f291cb4b9ead508d5090b248c9
- mexico: https://app.notion.com/p/410d3a3ca0a1421bba8fe353382bcf4f
- costa-rica: https://app.notion.com/p/578927403a774900af85757a8c92b65d
- colombia: https://app.notion.com/p/dbfa5972c1ab4e13a3d8e8bbfc786160
- brazil: https://app.notion.com/p/fba661910dd546d999351d12c8c84d4b
- chile: https://app.notion.com/p/68f160d43e6a430c8b4fc2ee4ad5b886
- bolivia: https://app.notion.com/p/d1a978cb32244c8c9db28e745bb66f98
- singapore: https://app.notion.com/p/7475c920d4154fce8293959e7f985595
- malaysia: https://app.notion.com/p/24a6869db21e80ccba42f8fff550c177
- cambodia: https://app.notion.com/p/2526869db21e80f8894dfc11cd24ca55
- sri-lanka: https://app.notion.com/p/32c6869db21e80eea510f3a68542f949

## Missing data and source choices

- India has only template questions and ellipses. Japan, Kenya, and Tanzania are blank. They remain unlinked and have no generated pages.
- Peru and Mexico each have two country drafts. Imported the complete September 10 country editorials, which cover the entire trip and all sections. The August duplicates are incomplete templates with unknown city-alias blocks; they were not combined with the complete drafts. None of the selected 15 sources reported truncation or unknown blocks.
- Linked city pages for Turkey, Greece, Peru, and Mexico are empty section templates. Their private links are not public CTAs. Following the user’s request, City Guides content, its data field, and shared rendering/styles have been removed from all countries.
- The US Full List child page was imported, then removed with City Guides at the user’s request: https://app.notion.com/p/8215569214f8420f8157aa668bc426ad . The 21-day itinerary uses ten authored day ranges; notes were not duplicated into 21 artificial entries.
- Existing SEO, assets, ratings, visit years, month states, component settings, and IDs were preserved. New pages reference existing map artwork; no visit years, ratings, month classifications, itinerary illustrations, or receipt totals were invented. New SEO descriptions use the first source overview paragraph.
- Budget prose and alternatives render without receipts when totals are absent. Cuisine prose renders without empty menu artwork. Itineraries without images retain their editorial day navigation and omit blank polaroids. Seasonal prose renders without a dial when the twelve month states are absent. Transport prose can render without tickets when no precise route is provided.
- Formatting delimiters were decoded to plain text in line with the skill; paragraph boundaries, explicit breaks, source headings, punctuation, and placeholders were retained. Inline emphasis and Turkey’s strikethrough styling are normalized to plain text, retaining every word.

## Author review

- Cambodia: receipt lines total $459; authored total is $440. Parent expense table totals $460, including a $30 tour and $15 airport bus versus $28 and $16 in the editorial. Preserved the country editorial and existing receipt, without silently correcting either.
- Cambodia: $75 for tickets does not equal two times the stated $37. The {tour operator} placeholder and [Country] FAQ placeholders remain authored. Grammar and questionable food/weather claims were not corrected.
- Bolivia: existing ticket durations (35 MINS and 8 HRS) and month states are retained from existing data; the revised source is less precise. No fresh factual verification was performed.
- Sri Lanka: existing Day 3 Little Adam’s Peak artwork is retained even though the revised Day 3 notes concern Nine Arches and Mirissa; assets were not reassigned.

## Verification

- All imported 648 source paragraphs compared against JSON, including grouping and order within each destination section. All 15 itinerary day counts/ranges match their titles.
- All JSON parses, map assets exist, and transport routes are unique in either direction.
- Generated all 15 entries with scripts/generate-country-pages.py; --check passes.
- git diff --check retains one source-preserved trailing space in generated Cambodia overview; the generated file was not hand-edited.
- Browser checks passed for all 15 guides at 1440px and 390px (30 page/viewport combinations): no console/runtime/HTTP errors, broken images, or horizontal overflow. FAQ toggles and itinerary next controls were exercised. Overview paragraph breaks were inspected visually on mobile and desktop.
- Confirmed the mobile Places list includes all 15 populated guides. New pages are published in repository data and generated locally; production deployment is separate.

## Follow-up: researched month compasses

The twelve initially missing month maps were subsequently filled at the user’s
request using online research. All fifteen published compasses are complete.
See [sources and classifications](best-months-research.md); source prose remains
unchanged and City Guides remain removed.
