---
name: country-editorials
description: Update Pareto Travel country editorials from a supplied Notion page or travel draft, copying source text verbatim into the existing country JSON while preserving formatting and order. Use for any country’s editorial refresh, not a visual redesign.
---

# Country editorials

Use the supplied draft as the editorial source and the current repository’s component consumers as the schema authority. Copy the source verbatim. Do not change any copy unless the user explicitly requests the specific copy edit.

## Find and read the source

- Identify the country slug, repository, and supplied source. In Pareto Travel, content lives in `src/data/countries/<slug>/`. Read repository guidance, relevant documentation, existing JSON, and the components that render it before editing.
- Read Notion through the connected Notion fetch tool. A malformed app link can be normalized using its page UUID. Check truncation and unknown blocks; fetch linked child pages only when needed for the editorial. Do not write back to Notion unless requested.
- If access fails, complete independent inspection and request the missing source text. Do not claim an existing draft was synchronized without reading it.

## Map content to the current contracts

| Source material | Pareto Travel destination |
| --- | --- |
| Overview | `country.json`: `overview`; leave SEO unchanged unless explicitly requested |
| Itinerary, day notes, extra-time ideas | `itinerary.json`: `itineraries[]`, `editorial`, ordered `days` |
| Seasonal guidance | `best-months.json`: `countries[slug]`, `editorial`, `months`, center labels |
| Meals | `cuisine.json`: `editorial`; `chapters` only where supported by the source |
| Transport | `inter-city-travel.json`: `editorial`, places and legs when supported |
| Costs and budget alternatives | `budget.json`: days, people, lineItems, total, editorial |
| Practical questions | `faqs.json`: ordered items and answers |

Inspect the actual shapes rather than copying documentation examples: some examples are illustrative. For example, the current budget uses formatted currency strings, and current ratings use six categorical parameters. Preserve IDs, assets, map coordinates, ratings, visit year, publication state, and component settings when the source does not justify changes. Do not invent missing country assets or publish a new country solely because a draft exists.

For transport tickets, display one ticket per route by default, keeping its first occurrence and treating the reverse direction as the same route. For example, show Santa Cruz → Sucre once; do not add Sucre → Santa Cruz unless the user explicitly requests a separate return ticket. Keep `places` and `legs` consistent with the component contract, and preserve all source editorial text about return journeys verbatim.

## Edit faithfully

- Preserve the source’s paragraph boundaries, explicit line breaks, subsection labels, and order. Map each source paragraph to a separate editorial array entry; never merge paragraphs to shorten the copy. Keep subsection labels on separate lines rather than folding them into prose. For a scalar field such as `overview`, retain paragraph separators as `\n\n` and explicit within-paragraph breaks as `\n`; ensure the renderer displays them (the country overview uses `white-space: pre-line`). Do not insert line breaks for incidental visual wrapping in Notion.
- Do not rewrite, paraphrase, summarize, shorten, expand, polish, correct grammar or spelling, change punctuation or capitalization, replace words, or alter the author’s tone. Preserve headings, labels, questions, answers, numbers, currencies, typos, and unfinished placeholders exactly as supplied. Do not omit source passages or add explanatory prose, recommendations, caveats, or budget notes.
- Formatting and serialization changes may represent the same visible text in JSON or HTML, but must not alter that text. Decode Notion formatting escapes as needed; distinguish markup from authored characters. If the current renderer cannot preserve the source, adapt rendering within the authorized scope or report the limitation instead of changing the copy to fit.
- Check day/night counts, party size, amounts, and arithmetic without silently correcting them. Report inconsistencies, questionable claims, and placeholders separately in the handoff. Do not insert those observations into site copy or invent/recalculate authored values without an explicit request.
- Research or fact-checking does not authorize copy changes. Preserve the supplied wording; proposed corrections belong in the handoff for the user to consider.
- Use paragraph arrays with plain text. The current best-months renderer supports `**bold**`; other editorials render literal text. Do not insert Markdown headings or HTML they cannot render. Keep existing detail links unless the user supplies an appropriate replacement; do not expose a private source link as a public CTA without intent.

## Verify and deliver

- Compare every imported passage against the source verbatim, allowing only equivalent serialization/formatting escapes. Confirm no text was added, removed, substituted, or reordered. Compare paragraph grouping and order against the source, including the overview, day notes, seasonal subsections, and budget categories. Check rendered breaks, not only JSON escaping.
- Parse all changed JSON, cross-check receipt arithmetic, and review the diff for unintended changes. Source placeholders must remain verbatim unless the user explicitly requests their replacement.
- After country metadata changes, run `python3 scripts/generate-country-pages.py`, then `python3 scripts/generate-country-pages.py --check`. Never hand-edit generated `src/countries/<slug>.html`.
- Serve `src` over HTTP and verify the changed data is reachable. When browser tools are available, inspect longer copy at mobile and desktop widths, check console/network errors, and exercise itinerary/FAQ interactions. Report any unavailable verification accurately.
- Record the source URL and any unresolved editorial discrepancies in the handoff or an appropriate repository note, without adding an unused runtime provenance schema.
- Report the updated country, key changes, checks, and unresolved source issues. An editorial update does not itself request a deployment or a Notion mutation.
