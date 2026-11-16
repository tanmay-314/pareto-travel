# Greece linked editorials

Updated 2026-10-06. Greece is the first country using the linked layout from
[Figma country frame 1680:40382](https://www.figma.com/design/IBbYsd9B2ZHOq7NXfEUhtL/Pareto-Travel?node-id=1680-40382).

## Sources

- [Greece](https://app.notion.com/p/3b96869db21e8087a1a4e14264f26a75)
- [Daily itinerary](https://app.notion.com/p/3f16869db21e8016a768d7916081e4ea)
- [Budget breakdown](https://app.notion.com/p/3f16869db21e8027a1e3cbe9c527ac64)

All three pages were read through Notion. Wording, paragraphs, seasonal bold
labels, and source order are preserved. The two accommodation links remain
clickable in the budget breakdown. Transport and FAQs already matched the
source and were left untouched. Country assets, coordinates, month ratings,
budget metadata, publication state, and SEO are unchanged.

## Behavior

- `/countries/greece`: itinerary overview, extra-time guidance, and a daily
  itinerary link; all four seasonal paragraphs; budget overview, alternatives,
  and a budget breakdown link. No editorial carousel controls remain in Greece.
- `/countries/greece/itinerary`: four days of source prose.
  Each day includes its existing artwork inside the shared 412 × 460 polaroid
  frame. Days with artwork use two columns, alternating the frame top-right,
  top-left, top-right, top-left. A day without artwork remains a full-width text
  section. Narrow layouts place the frame above the copy while retaining the
  alternating edge alignment.
- `/countries/greece/budget`: five budget categories and source links.
- Detail pages use the shared header and typography, plus a skip link and return
  links to the corresponding country section. Day/category sub-links and dotted
  dividers beneath section headings are intentionally omitted on both pages.
  Article content is generated HTML and works without JavaScript.
- Return links use the exact BACK arrow from Figma `1688:104521`, stored at
  `src/assets/icons/icon-back.svg`, with no visible country text. Its native
  240 × 60 dimensions scale to one line height (96 × 24 at the default type
  size), retaining the 4:1 ratio. The link provides a minimum 44px tap target
  and an accessible “Back to Greece” label. Hover and keyboard focus use the
  site's teal icon color through a mask of the unchanged SVG artwork.
- Other country data and generated entries are unchanged. Cambodia's legacy
  `#itinerary` placeholder continues to use the existing carousel.

The supplied Figma frame specifies the overview layout, not detail-page layouts.
Detail pages therefore use the site's existing article typography and navigation.
Existing map, menu, receipt, dial and polaroid artwork/animation geometry was
retained; this change does not claim whole-page pixel parity with the Cambodia
example in Figma.

Run `python3 scripts/generate-country-pages.py` after editing detail content.
Use `python3 scripts/serve.py` for local clean URLs. The generator's `--check`
now includes nested detail pages (17 generated entries total).

## Verification

- All JSON parsed; edited JavaScript passed syntax checks; generation is current.
- Generator checks covered escaped prose/links, unsafe URL rejection, local
  route opt-in, and nested stale-page detection without deleting authored pages.
- Checked the guide and both detail routes at 320, 390, 768, 1440 and 1920px:
  no horizontal document overflow. Inspected desktop/mobile screenshots,
  including the longer meal descriptions and settled polaroid artwork.
- Compared rendered itinerary, seasonal and budget detail text against JSON.
  Verified source imports directly from fetched Notion text.
- Exercised detail links, section links, return links, keyboard activation and
  visible focus, the skip link, polaroid selection, FAQs, reduced motion, and the
  shared Places dialog. Both detail pages also loaded with JavaScript disabled.
- Cambodia's carousel next/back controls and visible selected slide still work.
- Final browser check reported no console, page, or HTTP errors; all guide
  images loaded.

## Editorial notes

- The receipt's five line items sum to the authored $1450. Two nights each at
  $135 and $82 would total $434, while the source says $435; all authored values
  were preserved.
- Existing SEO still mentions hummus despite the updated overview saying feta
  cheese. SEO was outside the verbatim editorial import and remains unchanged.
- Source-preserved trailing spaces in the overview produce two whitespace
  warnings in generated Greece HTML under `git diff --check`. They do not alter
  rendered copy. The generated file was not manually edited.
- No deployment or Notion edits were made.
