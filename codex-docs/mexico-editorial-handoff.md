# Mexico editorial refresh

Updated 2026-09-22 from the [Notion draft](https://app.notion.com/p/Mexico-Fallen-Empires-Sunken-Waters-Rising-City-410d3a3ca0a1421bba8fe353382bcf4f), last edited 2026-09-22T17:42:01.396Z. The fetch contained the complete page and no unknown-block or truncation markers.

- Replaced the overview, itinerary title, six day entries, extra-time suggestions, and seasonal guidance with the source wording and paragraph order.
- Added the three seasonal subsections. June and July now use `avoid`, matching the source's June–October wet-season guidance; the other month classifications remain consistent.
- Added the 2023 receipt's five authored labels and amounts. Six itinerary days and five accommodation nights are consistent. Meals, transport prose, budget prose/alternatives, and FAQs already matched the source.
- Regenerated the Mexico HTML entry. Existing SEO, assets, map coordinates, publication state, and component settings were preserved.

## Source issues and formatting limits

- Receipt amounts sum to 1,540. The source gives no currency, traveller count, or total and explicitly says it lacks a complete expense total. No currency or total was inferred; the existing receipt renders missing traveller count and total as dashes.
- Source wording, including “the closes airport”, “an suburban sprawl”, and “the snake is their symbolism”, remains unchanged. Historical and engineering claims were copied without independent fact-checking.
- The itinerary renderer uses plain text. The italic emphasis on “public” in Day 1 is displayed as plain text with identical wording. Paragraph boundaries and separate headings are retained; invisible trailing spaces and Markdown formatting delimiters are not displayed as literal text.

## Verification

- Compared all 78 source passages, headings, and receipt rows with the JSON in order, allowing only equivalent formatting serialization.
- Parsed all repository data JSON; checked six days/five nights, receipt arithmetic, and all twelve month states.
- Country-page generation and `--check` passed; `git diff --check` passed.
- Served `src` over HTTP and verified the Mexico page in headless Chrome at 390px and 1440px. Checked exact rendered paragraph text, overview line breaks, all seven itinerary screens, keyboard Home navigation, all four seasonal screens, receipt labels/values/year, and all three FAQ toggles.
- Inspected mobile/desktop screenshots of the long Day 4 copy and receipt. No horizontal overflow, broken images, console errors, failed requests, or HTTP errors were observed.
