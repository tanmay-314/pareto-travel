# Pareto Travel — Project Status

This file gives a new Codex session a quick snapshot of active work. Keep it brief and update it whenever priorities or known constraints materially change.

Last updated: 2026-09-05

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
- generated `/countries/<slug>.html` pages with validated country data sources.

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

<!-- Keep only the most useful recent entries. Move durable decisions to docs/decisions.md. -->

- Added repository guidance for Codex.
- Replaced the previous country-page navigation with the six-link passport-stamp group from Figma.
- Replaced Cambodia-specific template and component sources with an explicit,
  documented generated country-entry strategy.

## Handoff notes

<!-- Add temporary context that the next coding session would otherwise lose. -->

- Treat Figma designs as sacrosanct.
- Prefer a single reusable country-page template driven by country data.
- Do not introduce a framework or dependency without approval.
