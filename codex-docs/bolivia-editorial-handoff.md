# Bolivia editorial refresh — 18 September 2026

Source: [Bolivia](https://app.notion.com/p/Bolivia-d1a978cb32244c8c9db28e745bb66f98), fetched through the connected Notion tool. The page was last edited at 2026-09-18T17:02:03.784Z. All seven editorial sections were returned without truncation or unknown-block markers; no child pages were needed.

## Changes

- Updated `src/data/countries/bolivia/budget.json` with the new introduction, five ordered expense categories, and authored 2023 receipt totaling $1000. Preserved all wording, paragraph boundaries, labels, and amounts. The follow-up refresh also replaced both budget alternatives with the latest source paragraphs. Decoded Notion currency escapes and inline emphasis to plain text.
- Set five days from the itinerary and budget prose. The two-traveller count is inferred from the meal-for-two reference and the matching tour arithmetic: two $60 places plus one $30 tip equals the authored $150 experience total.
- Preserved the literal `STAYS * 5 NIGHTS` receipt label. The Cagnapa link is represented by its visible label in the plain-text editorial; its public source URL is https://www.airbnb.co.in/rooms/566663445269514224.
- Updated the overview to the latest three source paragraphs, preserving its paragraph separators, and regenerated the public Bolivia page. The five itinerary days, seasonal guidance, transport, meals, and FAQs already matched the supplied draft. Assets, IDs, SEO, month ratings, settings, publication state, and existing transport durations remain unchanged. Santa Cruz → Sucre and Sucre → Uyuni remain the only tickets; reverse journeys remain in the prose. Recommendation badges remain removed.

## Author review

- Receipt arithmetic is correct: $230 + $200 + $150 + $190 + $230 = $1000.
- The introduction says $215 for visas, while approximately $110 per person implies $220 for two. Adding the $10 Uber total produces $225 using the introductory figure or $230 using the per-person estimate; the receipt says $230. All authored amounts remain unchanged.
- The listed return-flight and bus prices imply ($70 + $26) × 2 = $192 for two travellers, while the receipt says $190. This may be rounding; no adjustment was made.
- Five paid nights in the budget (three in Uyuni plus two other nights) are not fully reconciled with the five-day itinerary's outbound and return overnight buses. The accommodation amounts themselves reconcile: $200 + $15 + $15 = $230. Preserved both the itinerary and budget without inventing arrival/departure days or changing night counts.
- Preserved grammar such as “buses to and fro Uyuni was” and the new overview’s “but in opinion”. No unfinished placeholders were found. Historical, economic, visa, altitude, and safety claims were copied as authored and were not independently fact-checked.

## Verification

- Reconstructed all seven sections from their destination data and compared all 80 source lines, including unchanged sections, paragraph grouping, subsection order, FAQs, and literal receipt text.
- All 107 repository JSON files parse; transport places/legs are consistent and routes are unique in either direction. Ran the country-page generator and its `--check`; all 15 generated entries are current. `git diff --check` reports only the two source-preserved trailing spaces in the generated Bolivia overview; the generated HTML was not hand-edited.
- Served `src` over HTTP and confirmed the fetched budget matches local JSON. Browser checks passed at 390px and 1440px: all seven budget screens and receipt fields, six itinerary screens, four seasonal screens, three transport screens, and three FAQ toggles. The two tickets have no recommendation badges. Rechecked the updated overview and alternatives at both widths, including rendered overview paragraph breaks. Inspected mobile and desktop screenshots; no horizontal overflow, broken images, console/runtime errors, failed requests, or HTTP errors were recorded. Used the existing local Playwright/Chrome setup because in-app browser execution and the browser CLI are unavailable in this session.
- No rendering changes, deployment, or Notion mutation were needed.
