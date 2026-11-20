# Overview and best-time refresh — 20 November 2026

Source index: https://app.notion.com/p/6b1319ac2c834f048cccfea29357c7e0

Read all 20 country parent pages and the relevant country drafts through the connected Notion tool. Imported or confirmed Overview and Best Time to Visit for all 15 existing published guides. United States already matched both sections; Cambodia and Greece already matched their overviews. Added Japan's newly substantive two sections as unpublished draft data, without inventing assets, SEO, month ratings, or other sections. No Japan public page or navigation link was generated.

India still contains template questions and ellipses, with no substantive overview or seasonal guidance. Kenya, Tanzania, and Vietnam remain blank. No content was invented for these countries. Peru's complete country editorial is the source; its older duplicate has an incomplete seasonal section and unknown city-alias blocks. The selected complete sources have no reported truncation or unknown blocks.

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
- japan: https://app.notion.com/p/3f16869db21e80e6aa40e6246e4f6dac

## Import choices

- Copied 96 prose paragraphs, retaining paragraph grouping, source headings, explicit breaks, wording, punctuation, spelling, and order. Inline formatting tags become equivalent plain text under the existing overview/carousel contracts. Japan's seasonal reference link labels remain plain text.
- Source month code blocks configure the dial rather than appearing as public prose. Turkey's incomplete JSON fragment still supplies all 12 unambiguous month entries; Greece supplies a month-name list. Existing month maps remain where no replacements were supplied (United States); Japan has no invented map.
- Removed superseded seasonal subsections where the source now supplies only paragraphs. Preserved authored seasonal headings for United States and Sri Lanka, including Sri Lanka's October & November subsection after its month code block.
- Preserved existing SEO, maps, assets, IDs, publication states, unrelated editorial sections, and component settings. Generated public HTML was regenerated through the existing script.

## Author review

Source wording remains unchanged; no external fact-check was performed.

- Cambodia says the dry season draws massive crowds, then attributes TWENTY times more people to the wet season. This apparent contradiction remains verbatim.
- Turkey's prose says to avoid July/August while its explicit dial rates them good; winter prose includes March while the dial rates March good.
- Iceland's dial rates November/December good, January/February avoid, and every other month good, despite nuanced winter and aurora advice.
- Peru recommends avoiding November–April while explicitly rating April/November good.
- Costa Rica's dial rates the wet/cloud-forest season best while its beach guidance favors the dry season.
- Malaysia's moderate-season prose includes March while the dial rates March best. September is now avoid per the supplied map.
- Sri Lanka retains both the general final seasonal paragraph and the additional October & November subsection. The overview's “Separated only a strait” and other grammatical issues remain authored.
- Existing SEO descriptions can differ from the refreshed overview; SEO was outside this request.
- Japan remains a partial draft requiring the rest of its guide data and publication authorization before a public guide can be generated.

## Verification

- All 109 JSON files parse. Compared all 16 imported section pairs against the saved source extraction, including exact paragraph arrays, heading order, and explicit month ratings. A second HTML-parser comparison confirmed the visible source text for every section.
- Confirmed every pre-existing country metadata field except overview, and every seasonal setting except editorial/seasons/months, matches HEAD.
- Page generation and --check pass (17 existing public entries, including Greece's two detail pages). Japan remains unpublished.
- Served src through scripts/serve.py; all 47 checked page/data endpoints returned HTTP 200. JSON responses match local bytes; all 15 generated overview texts retain the imported paragraph breaks. Existing overview pre-line CSS is intact.
- git diff --check reports only 10 source-preserved trailing-space lines in generated overview HTML. Generated files were not hand-edited.
- Browser visual, mobile/desktop, console/network, and interaction verification could not run: the native Chrome connection timed out and the in-app browser was unavailable.
- No deployment or Notion mutation.
