# Pareto Travel — Project Status

This file gives a new Codex session a quick snapshot of active work. Keep it brief and update it whenever priorities or known constraints materially change.

Last updated: 2026-09-09

## Current objective

<!-- One or two sentences describing the current milestone. -->

- Continue refining the reusable country page and add country content through
  the generated public-entry workflow.

## Current implementation

Known reusable design/component areas include:

- annual travel dial;
- budget receipt;
- polaroid itinerary;
- country navigation passport stamps;
- country maps and dot artwork;
- cuisine/editorial sections;
- shared tokens, typography, reset, and global styles.
- extensionless `/countries/<slug>` routes backed by generated pages with
  validated country data sources.

Update this list with file paths and implementation status once the files are present in the repository.

## In progress

- Nothing recorded yet.

## Next up

- Record the next prioritized task here.

## Known gaps

- Repository-specific commands and deployment workflow are not yet documented.
- Final directory paths should be reconciled with the actual repository tree.
- Component contracts should be linked to their implementation files as they are integrated.

## Decisions needed

- None recorded yet.

## Recently completed

- Added Bolivia’s three-screen inter-city editorial carousel using shared controls and map-relative scaling.

- Imported Bolivia’s Notion editorial and published its available sections; renamed the FAQ
  section heading to EVERYTHING ELSE YOU NEED TO KNOW.

- Added the seven-screen budget carousel (including bigger/smaller-budget guidance) using the shared editorial controls.

- Added the four-screen best-months carousel and shared its controls with the itinerary carousel.

<!-- Keep only the most useful recent entries. Move durable decisions to docs/decisions.md. -->

- Added the Cambodia itinerary editorial carousel from Figma: overview, Day 1, and Day 2, with supplied arrows, pagination, keyboard and swipe navigation.
- Added repository guidance for Codex.
- Replaced the previous country-page navigation with the six-link passport-stamp group from Figma.
- Replaced Cambodia-specific template and component sources with an explicit,
  documented generated country-entry strategy.

## Handoff notes

- Bolivia source: https://app.notion.com/p/Bolivia-Salt-of-the-Earth-d1a978cb32244c8c9db28e745bb66f98
  (read 2026-09-09). Overview, all five itinerary days, seasonal guidance, and
  transport paragraphs were copied verbatim, preserving paragraph order.
- Bolivia is now `published` at `/countries/bolivia`, linked from the world map. Meals and FAQ answers are empty; budget ellipses and
  `[Country]` question placeholders remain as authored. No receipt amounts,
  party size, visit year, ratings, map locations, or itinerary images were
  invented. Publication adds SEO title/description and references the existing Bolivia map asset.
- Seasonal data records only the ten months covered by the source. November,
  December, and dial center labels still need editorial input before the dial
  can render. The text recommends the start of the dry season but describes
  late October as its end; preserve both statements pending author review.
- The source’s unfinished “If we visited a few weeks” sentence and its claim
  about legal child labour remain unchanged and need editorial review. The
  five-day itinerary has five day entries; no budget arithmetic is available.
- Published incomplete sections are omitted automatically: meals, budget, and
  unanswered FAQs. Seasonal text renders while the incomplete dial stays hidden.
  Visit year is optional, and navigation only links to available sections.
- Publication verification: generated both country pages and passed `--check`.
  At 1440px and 390px, verified Bolivia’s actual public entry, itinerary and
  seasonal navigation, omitted sections, and the homepage link; checked Cambodia
  for regressions. No browser console, page, or HTTP errors.
- Generation also refreshed Cambodia’s stale fallback overview from its existing
  JSON. `git diff --check` flags one source-preserved trailing space there; the
  generated file was not hand-edited.

<!-- Add temporary context that the next coding session would otherwise lose. -->

- Treat Figma designs as sacrosanct.
- Prefer a single reusable country-page template driven by country data.
- Do not introduce a framework or dependency without approval.
