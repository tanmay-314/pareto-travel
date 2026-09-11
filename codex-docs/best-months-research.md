# Best-months compass research

Researched 11 September 2026. Added all twelve month classifications to the twelve
previously empty compasses. Cambodia, Bolivia, and Sri Lanka retain their existing
ratings. No source editorial was rewritten.

The categories below are editorial judgments inferred from seasonal evidence and
the route on each country page, not ratings assigned by the cited organizations.
Best means a preferred travel window; Good means workable with seasonal tradeoffs;
Avoid means a weaker choice for this particular itinerary. It is not a safety
advisory or a claim that the whole country should be avoided. Whole-month ratings
necessarily simplify transitions within a month. No category quota is imposed:
Brazil and Singapore have no Avoid months.

| Country / route emphasis | Best | Good | Avoid | Evidence and reasoning |
| --- | --- | --- | --- | --- |
| Brazil: Manaus, Rio, Iguaçu, São Paulo | Jul–Sep | Jan–Jun, Oct–Dec | None | [Audley seasonal guide and monthly climate table](https://www.audleytravel.com/brazil/best-time-to-visit): July–September combines lower Manaus rainfall with cooler southern stops. All months remain viable; high water offers different Amazon experiences. This differs deliberately from a beach/Carnival-focused summer recommendation. |
| Chile: Patagonia, with Santiago and Rapa Nui | Jan–Mar, Nov–Dec | Apr, Oct | May–Sep | [Chile Travel](https://chile.travel/en/blog/puma-sighting-in-chile-everything-you-must-know-for-a-wild-expedition/) identifies October–April for Torres del Paine. Prefer the warmer core of that window; October and April are shoulder alternatives. The rating is anchored on Patagonia, not Santiago or Rapa Nui alone. |
| Colombia: Medellín, Cartagena, Bogotá | Jan–Mar, Dec | Apr, Jun–Sep | May, Oct–Nov | [Colombia Travel](https://colombia.travel/en/practical-information/weather) describes regional variation and wetter April–May and October–November periods. Prefer the dry start/end of the year; April is a transition, June–September workable alternatives. Cartagena remains hot even in preferred months. |
| Costa Rica: San José and Monteverde | Jan–Apr | May–Aug, Nov–Dec | Sep–Oct | [Visit Costa Rica](https://www.visitcostarica.com/plan-your-trip/when-to-visit) places the dry season from mid-December through April and identifies autumn as peak green season. December spans a transition, so Good; September–October is the weakest window. Cloud-forest mist remains normal. |
| Greece: Athens and Santorini | May–Jun, Sep | Apr, Jul–Aug, Oct | Jan–Mar, Nov–Dec | [Visit Greece’s Santorini route](https://www.visitgreece.gr/en/routes/santorini-sunset-overlooking-the-caldera) favors spring–autumn and notes summer heat. Combined with the authored preference for May/June/September, peak summer is Good rather than Best. Winter is a poorer fit for this island itinerary, not for Athens in isolation. |
| Iceland: fast south/east road trip | Jun–Sep | Apr–May, Oct | Jan–Mar, Nov–Dec | [Audley’s seasonal guide](https://www.audleytravel.com/iceland/best-time-to-visit-iceland) supports summer access and September’s continuing activities, with increasing road/weather constraints in October and limited winter daylight. April/May and October require more flexibility. Winter aurora trips need a different itinerary; summer does not guarantee aurora viewing. |
| Malaysia: Kuala Lumpur and Langkawi | Jan–Mar, Dec | Apr–Aug, Nov | Sep–Oct | [Visit Langkawi / Travelindex weather guide](https://www.visitlangkawi.org/essentials/weather/) describes January–March’s dry core, an extended high season into April, and September–October rains. December is a preferred early dry-season option; November remains transitional. This is a west-coast assessment, not an east-coast island calendar. |
| Mexico: CDMX, Teotihuacan, Chichen Itza, Bacalar | Jan–Apr, Dec | May–Jul, Nov | Aug–Oct | [Audley’s month-by-month guide](https://www.audleytravel.com/us/mexico/best-time-to-visit) favors December–April, with wetter summer/autumn and Caribbean storm exposure. Late wet-season months receive Avoid for this combined route. The author's enjoyable September visit remains unchanged; a good past trip does not define the most reliable weather window. |
| Peru: Lima, Cusco, Machu Picchu | May–Sep | Mar–Apr, Oct–Nov | Jan–Feb, Dec | [Audley](https://www.audleytravel.com/peru/best-time-to-visit) identifies May–October as dry and January/February as the wettest months. Prefer May–September; October is a transitional alternative, and March/April/November remain workable with rain. December is part of the wetter Andean period. Coastal Lima alone would yield a different calendar. |
| Singapore: city, gardens, zoo | Feb–Mar | Jan, Apr–Dec | None | [Meteorological Service Singapore](https://www.weather.gov.sg/climate-climate-of-singapore/) identifies February as driest and November–January as wetter; [SingStat](https://www.singstat.gov.sg/publications/reference/ebook/society/environment) describes the relatively dry February–early March period. February/March get a modest preference. Rain alone does not make this adaptable city itinerary an Avoid. |
| Turkey: Istanbul and Cappadocia | Apr–Jun, Sep–Oct | Mar, Jul–Aug, Nov | Jan–Feb, Dec | [GoTürkiye](https://goturkiye.com/culturaljourneys/hot-air-balloon) favors spring/autumn for Cappadocia, while noting ballooning operates year-round. April–June and September–October balance that guidance with the source’s early-June trip; March/November are cooler shoulder alternatives. Flights remain weather-dependent in every month. |
| United States: California, Yosemite, desert Southwest, eastern cities and Niagara | Jun–Sep | Apr–May, Oct | Jan–Mar, Nov–Dec | [National Park Service](https://home.nps.gov/yose/planyourvisit/seasons.htm) documents Yosemite’s winter access constraints and late-spring transition. Summer–early autumn best fits the authored coast-to-coast itinerary. Spring/autumn require routing flexibility; summer desert heat still requires planning. This is not a universal US climate calendar. |

## Verification

- All 15 published countries contain exactly January–December and only the existing `best`, `good`, and `avoid` values.
- Compared all seasonal JSON against a pre-edit snapshot: only the twelve missing `months` objects changed; all prose, seasonal subsections, and three pre-existing compasses are identical.
- Sources and interpretation are recorded here rather than added as unused runtime metadata.
- Browser verification passed for all fifteen guides at 1440px and 390px: all twelve SVG month labels and segment states match the JSON, compasses are visible, no City Guides reappeared, and no settled-layout overflow or console/runtime/HTTP errors were recorded. Inspected Malaysia’s desktop and mobile compass visually.
- Generated-page freshness check passes; no HTML regeneration was needed for these section-only data changes.
