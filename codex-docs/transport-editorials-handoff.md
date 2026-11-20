# Going from place to place refresh — 20 November 2026

Source index: https://app.notion.com/p/6b1319ac2c834f048cccfea29357c7e0

Refetched all 17 relevant country drafts through the connected Notion tool. Refreshed or confirmed the transport section for all 15 published guides and added transport data to Japan's unpublished draft. United States and Cambodia already matched. No substantive transport copy exists for placeholder-only India or the blank Kenya, Tanzania, and Vietnam pages read during the preceding refresh. Selected source responses reported no truncation or unknown blocks.

## Sources

- United States: https://app.notion.com/p/59deef92a10f42bfb7979cc44e5c81f2
- Turkey: https://app.notion.com/p/3b96869db21e8027b23ad23bc44547be
- Greece: https://app.notion.com/p/3b96869db21e8087a1a4e14264f26a75
- Iceland: https://app.notion.com/p/3b96869db21e806b82fdd848ca1a63ee
- Peru: https://app.notion.com/p/df8d90f291cb4b9ead508d5090b248c9
- Mexico: https://app.notion.com/p/410d3a3ca0a1421bba8fe353382bcf4f
- Costa Rica: https://app.notion.com/p/578927403a774900af85757a8c92b65d
- Colombia: https://app.notion.com/p/dbfa5972c1ab4e13a3d8e8bbfc786160
- Brazil: https://app.notion.com/p/fba661910dd546d999351d12c8c84d4b
- Chile: https://app.notion.com/p/68f160d43e6a430c8b4fc2ee4ad5b886
- Bolivia: https://app.notion.com/p/d1a978cb32244c8c9db28e745bb66f98
- Singapore: https://app.notion.com/p/7475c920d4154fce8293959e7f985595
- Malaysia: https://app.notion.com/p/24a6869db21e80ccba42f8fff550c177
- Cambodia: https://app.notion.com/p/2526869db21e80f8894dfc11cd24ca55
- Sri Lanka: https://app.notion.com/p/32c6869db21e80eea510f3a68542f949
- Japan: https://app.notion.com/p/3f16869db21e80e6aa40e6246e4f6dac

## Changes

- Copied 59 paragraphs and standalone subsection labels verbatim, preserving order, paragraph grouping, authored spelling, punctuation, and unfinished text. Formatting tags and hyperlinks use their visible plain-text labels under the existing component contract.
- Imported explicit route names, modes, and durations from the source code blocks. Repaired serialization punctuation only; no place names or authored values were corrected.
- Each route appears once in either direction. Removed Guatape → Medellin, Rapa Nui → Santiago, and Torres del Paine → Puerto Natales as repeated return routes. All prose about return journeys remains verbatim.
- Colombia and Chile use optional additionalJourneys groups to retain correct origins after deduplication, rather than drawing invented connecting routes. Existing places/legs data remains supported. All groups use the existing journey geometry and resize independently; their observers are cleaned up on re-render/error. Updated component/data documentation.
- Bolivia's source now supplies 30 minutes for Santa Cruz → Sucre, replacing the older 35 MINS. Peru's three legs each have the authored 1.5 hrs.
- Iceland now has the complete supplied 14-stop, 13-leg driving route, including its return to Reykjavik. These are distinct routes, not duplicate reversals.
- Preserved publication state, assets, titles, and unrelated sections. Japan remains unpublished. No generated HTML changed or required regeneration because no country metadata changed.

## Unresolved source issues

- Brazil's final paragraph ends “Within the cities, you can take an Ube”. Retained exactly.
- Brazil lists four stops but only two route legs. Kept its existing Iguazu → Sao Paulo flight with no duration; the renderer uses its established X HRS placeholder and accessible “Duration not provided” text. No duration was guessed.
- Chile describes Santiago → Rapa Nui as 6+ hours in prose but 5.5 hrs in the route block. Both authored values remain.
- Several source route blocks are invalid JSON: missing commas, extra braces, trailing commas, or incomplete outer wrappers. Ordered names/modes/durations were unambiguous except Brazil's missing final leg, handled above.
- Source claims about Malaysia's Penang–Langkawi taxi journey, Singapore's Uber reference, Turkey's early flight/balloon timing, and airline/service availability warrant author review. No external fact-check or silent correction.
- Japan's Within cities, Between cities, and Bags and practicalities labels are separate editorial entries. No precise continuous route was invented from its broad transport advice.
- Inline links (Less Taxi and Japan transport references) retain their visible labels as plain text, consistent with existing transport rendering.

## Verification

- All JSON files parse; 59 source paragraphs/headings match the import exactly, including paragraph count/order. A separate HTML-parser comparison confirmed visible text equivalence.
- All 16 datasets satisfy route group lengths and contain 42 unique routes, without duplicate reverse legs.
- Simulated-DOM checks exercised the production renderer for all 16 datasets: route/graphic counts, no invented return connections, missing-duration accessibility text, desktop/mobile scaling, observer cleanup on re-render/error, invalid group rejection, and legacy/grouped editorial carousel titles. These are code checks, not browser visual verification.
- All 16 transport JSON endpoints returned HTTP 200 with bytes matching local files; Colombia, Chile, Iceland, and Peru public pages also returned 200 with their transport mount points.
- Page generator --check passes (17 existing generated entries). git diff --check passes.
- Actual browser visual/layout, console/network, and interaction checks remain unavailable: the native Chrome connection timed out. No claims of visual parity.
- No deployment or Notion mutation.
