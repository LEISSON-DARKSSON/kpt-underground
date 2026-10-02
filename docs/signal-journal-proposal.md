# Signal as an open studio journal: decision proposal (H03 / D1)

Status: PROPOSED_NOT_APPLIED

This is a content diff for owner approval. No file under `src/` and neither claim-register file has been changed. Source of truth for ids: [claim-register.md](claim-register.md) and [claim-register.json](claim-register.json) (119 claims, not re-audited here). Line numbers below are the register's.

## (a) The decision

Recommendation (one): turn `/signal` into an **open studio journal**. The URL `/signal` and the nav and footer link stay. There is no membership, no event access, no "members only", no access gate, and no e-mail signup or "we will notify you" promise until a real receiver exists (H09). Nothing on the site says or implies that something is closed, secret, live or exclusive. Because no journal entry is documented, the page ships with an honest empty state; every one of the seven current feed entries is removed and none is replaced by an invented one. This is register decisions D1 to D4, D6 and D7 as one change, plus D5 for the two "advertising / channels" lines (section e). D2 resolves to "remove" unless the owner supplies a documented event.

Why one decision: today the page promises a closed network, events and early access (17 `SERVICE_PROMISE`, 22 `UNSUPPORTED` claims in the register, most of them Signal), none of which exists. A visitor who finds the gate code (it is on the home page) reads invented venues, a named performer and a jacket that is not in the catalog.

## (b) Before and after, every affected visible string

Action: R = reworded, X = removed (no replacement string), K = kept (listed only where a reader might expect a change).

### `/` home

| Surface | Before | After | Ids | Act |
|---|---|---|---|---|
| Signal CTA eyebrow | `02 // THE SIGNAL` | unchanged | H03-015 | K |
| Signal CTA heading | `THE SIGNAL` / green `NETWORK` | `THE SIGNAL`, green accent on SIGNAL, no second line | H03-016 | R |
| Signal CTA body | `A closed channel for those who keep it underground.` | `Notes from the studio on design and new objects. Open to everyone.` | H03-017 | R |
| Signal CTA link | `● ENTER SIGNAL NETWORK` (cursor label `ENTER`) | `● READ THE SIGNAL` (cursor label `READ`; the label attribute is not registered) | H03-018 | R |
| Hero HUD | `FREQ: 140HZ` | `FREQ: SUB-BASS` (already used on /story) | H03-013 | R |
| Hero HUD | `SYS: OPERATIONAL`, `SIGNAL: ACTIVE` | unchanged (decorative, no service promised) | H03-012, H03-014 | K |
| Home ticker | `SIGNAL / 01`, `SUBSURFACE / 02` and the other 6 items | unchanged. These are real catalog collection names, not the Signal feature | H03-005 to H03-011 | K |
| Manifesto strip | `WE DO NOT ADVERTISE` | `WE ARE INDEPENDENT` (section e) | H03-023 | R |
| Manifesto strip | `NO CONVENTIONAL CHANNELS` | `MADE TO ORDER` (existing shop fact) | H03-027 | R |

### `/signal`

| Surface | Before | After | Ids | Act |
|---|---|---|---|---|
| Metadata title | `Signal Network` | `Signal` (renders `Signal — KEEP IT UNDERGROUND`) | H03-062 | R |
| Metadata description | `A closed, non-algorithmic channel. Not a newsletter. A direct line to events that have no public existence.` | `Studio notes from KEEP IT UNDERGROUND: design process and new objects. Open to everyone.` | H03-063 | R |
| Hero badge 1 | `CLASSIFIED` | unchanged (visual flavour) | H03-064 | K |
| Hero badge 2 | `MEMBERS ONLY` | `OPEN` | H03-065 | R |
| H1 | `THE SIGNAL NETWORK` | `THE SIGNAL` | H03-066 | R |
| Hero paragraph | `A closed, non-algorithmic channel. Not a newsletter. Not a loyalty programme.` | `Notes from the studio on design and new objects. Open to everyone.` | H03-067 | R |
| Hero paragraph | `A direct line to events that have no public existence.` | removed | H03-068 | X |
| Ticker | `SIGNAL ACTIVE`, `FREQUENCY LOCKED`, `NO ALGORITHM`, `DIRECT ACCESS`, `MEMBERS ONLY`, `140HZ` | `SIGNAL ACTIVE`, `NO ALGORITHM`, `STUDIO JOURNAL`, `OPEN TO EVERYONE` | H03-069 K, H03-071 K, H03-070 X, H03-072 X, H03-073 X, H03-074 X | R |
| Frequency gate (whole component: `FREQ-GATED`, `CLASSIFIED`, `ACCESS RESTRICTED.`, `A closed channel exists beyond this point...`, `Those who were listening...`, input placeholder, error text, `// CORRECT CODE UNLOCKS ACCESS`) | shown first, hides the page | component deleted, the page is open | H03-075 to H03-082 | X |
| Open header badge | `● ACCESS GRANTED` | `● OPEN` | H03-083 | R |
| Open header label | `SIGNAL NETWORK // LIVE FEED` | `SIGNAL // STUDIO JOURNAL` | H03-084 | R |
| Card 01 | `DIRECT EVENT ACCESS` / `Location coordinates for parties with no public existence.` | removed | H03-085, H03-086 | X |
| Card 02 | `CULTURE PARTICIPATION` / `Early drops. Direct communication. Closed broadcast channels.` | `STUDIO NOTES` / `Design notes and new objects as they are published.` | H03-087, H03-088 | R |
| Card 03 | `NO ALGORITHM` / `Nothing here is ranked, boosted or sponsored.` | unchanged | H03-089, H03-090 | K |
| Card 04 | `WORD OF MOUTH` / `The way in is already knowing someone who knows.` | removed (3 cards become 2) | H03-091, H03-092 | X |
| Feed eyebrow | `SIGNAL LOG // 7 ENTRIES` (not registered) | removed with the feed | none | X |
| Feed entry sig-007 | `52.4934°N, 13.4437°E — Warehouse district. Gate 7. ...` + types `LOCATION`, `FREQUENCY` | removed | H03-097, H03-093 | X |
| Feed entry sig-006 | `New transmission on 33Hz. Duration: 4 hours. ...` | removed | H03-098 | X |
| Feed entry sig-005 | `NEOONDREED live techno set ...` + `EVENT`, `UPCOMING` (dated 2025-03-18, already past) | removed (names a performer, no consent on file) | H03-099, H03-094, H03-096 | X |
| Feed entry sig-004 | `Prototype Field Jacket — 12 units. Available through Signal Network only.` | removed (no such product; visibility is the owner's call) | H03-100 | X |
| Feed entry sig-003 | `Frequency embedded in last week's mix. First 20 ... early access to SS-2025 collection.` | removed | H03-101 | X |
| Feed entry sig-002 | `51.5074°N, 0.1278°W — Arch 42. ...` | removed | H03-102 | X |
| Feed entry sig-001 | `LEISSON + DARKSSON — joint set. Krematoorium. Capacity: 200. No phones.` + `EVENT` | removed by default. Re-add only if the owner confirms it happened, with real date and venue | H03-103, H03-095 | X |
| Empty state (new) | none | `NO ENTRIES YET.` and a link `BROWSE THE SHOP` to `/shop` | new ids | new |

### `/story`

| Surface | Before | After | Ids | Act |
|---|---|---|---|---|
| Section badge | `MEMBERS ONLY` | `OPEN` | H03-055 | R |
| Section badge | `CLASSIFIED` | unchanged | H03-054 | K |
| Section heading | `THE SIGNAL NETWORK` | `THE SIGNAL` | H03-056 | R |
| Card 1 `WHAT IT IS` | `A closed, non-algorithmic channel. Not a newsletter. Not a loyalty programme. A direct line to events that have no public existence.` | `Notes from the studio on design and new objects. Open to everyone.` | H03-057 | R |
| Card 2 title | `WHAT MOVES THROUGH IT` | `WHAT IT CARRIES` (title not registered) | none | R |
| Card 2 body | `Location codes. Frequency callouts. Access instructions for parties not on any map. The only way in is already knowing.` | `Studio notes, design process, new objects.` | H03-058 | R |
| Card 3 title | `HOW YOU ENTER` | `HOW TO READ IT` (title not registered) | none | R |
| Card 3 body | `You find it the way you find the good parties: someone tells you. What follows cannot be described further here.` | `Anyone can read it. /signal is linked from the site navigation.` | H03-059 | R |
| Card 4 | `WHY IT WORKS` / `Because the information is real. The relationships are real. We were there before the brand existed.` | card removed (3 cards remain). Invented history | H03-060, H03-061 | X |
| Footer line (optional, outside D1: a technical-spec claim, not a Signal promise; may be approved or deferred separately) | `SIGNAL: ACTIVE // CERT: KPT-UG-001 // FREQ: 20–200HZ // CLASS: UNDERGROUND` | `KEEP IT UNDERGROUND // KPT-UG-001` (no certification, no numeric range; register's own proposal) | H03-045 | R |
| Manifesto line | `WE DO NOT ADVERTISE.` | `WE ARE INDEPENDENT.` | H03-046 | R |
| Rest of the story page and manifesto (`FREQ: SUB-BASS`, `WE DO NOT TREND.`, ...) | unchanged (brand voice, no promise) | | H03-031 to H03-044, H03-047 to H03-053 | K |

### Nav, footer, metadata

| Surface | Before | After | Ids | Act |
|---|---|---|---|---|
| Navbar link, footer link | `SIGNAL` to `/signal` | unchanged | none | K |
| Navbar HUD | `LIVE`, `SIGNAL ACTIVE` | unchanged (decorative) | H03-107, H03-108 | K |
| `sitemap.ts` | lists `/signal` | unchanged | none | K |
| Root and /story metadata, /help copy, footer copy | | unchanged | H03-031, H03-104 to H03-106, H03-109 to H03-119 | K |
| `not-found.tsx` `... does not exist in this network.` | | unchanged. Not in the scanned set, not a promise. Reword in a later pass if desired | none | K |

Deviation from the register: for H03-057 and H03-067 the register suggests ending with "no membership, no event access". This proposal drops the negation. A public line that denies things nobody asked about is itself a claim, and it trips the keyword scanner (`member`, `event`).

## (c) Removed, reworded, kept

- **Removed (30 register entries, no replacement string):** H03-060, 061, 068, 070, 072, 073, 074, 075 to 082 (the whole gate), 085, 086, 091, 092, 093 to 103 (all seven feed entries and their type and status badges).
- **Reworded (22):** H03-013, 016, 017, 018, 023, 027, 045 (optional), 046, 055, 056, 057, 058, 059, 062, 063, 065, 066, 067, 083, 084, 087, 088.
- **Kept (the other 67; 119 = 30 + 22 + 67):** all `SHOP_FACT` entries (store, help, footer, metadata), the home and story brand poetry, `CLASSIFIED`, `NO ALGORITHM` and its card, the `SYS`/`SIGNAL: ACTIVE`/`LIVE` HUD labels, `FREQ: SUB-BASS`. Brand poetry stays wherever it is voice and promises nothing a visitor can receive.
- **New strings (need new register entries, class BRAND_POETRY or SHOP_FACT, status OK):** `OPEN` (3 places), `OPEN TO EVERYONE`, `STUDIO JOURNAL`, `FREQ: SUB-BASS` (home), `NO ENTRIES YET.`, `BROWSE THE SHOP`, `WE ARE INDEPENDENT` (2 places), `WHAT IT CARRIES`, `HOW TO READ IT`, plus the reworded strings above.
- **Structure:** `frequency-gate.tsx` is deleted; `signal-feed.tsx` loses its data and becomes the empty state; `signal-page-client.tsx` no longer needs `"use client"` and becomes a server component (CLAUDE.md convention).

## (d) Technical note: the gate was never a gate

- The code is a string compare in the browser: `CORRECT_CODE = "140HZ"` (`frequency-gate.tsx:9`), and `140` is also accepted (`frequency-gate.tsx:14`). The "unlocked" state is `useState(false)` in `signal-page-client.tsx`.
- The code is printed publicly: home HUD `FREQ: 140HZ` and the `/signal` ticker item `140HZ`.
- The gated text ships to every visitor. `SignalFeed` is imported statically by a `"use client"` module, so all seven entries are in a public static JS chunk. Checked read-only in the existing local build: `.next/static/chunks/0hh1w1hodg8y7.js` contains both `Warehouse district` and `140HZ`.
- Consequence: nothing here was ever confidential. Deleting the strings stops serving them from the next deploy, but earlier deploys may be cached or archived. Treat the entries as already published, which is one more reason none is kept without owner confirmation. The coordinates (Berlin, London) and the named performer in the old entries may point at real places or people; only the owner knows.

## (e) "WE DO NOT ADVERTISE" and "NO CONVENTIONAL CHANNELS"

Both are absolute statements of conduct (H03-023, 027, 046) and the shop itself is a conventional channel. The 14-day test (H06/H10) may use channels these lines forbid.

Recommended rewording, one claim: **`WE ARE INDEPENDENT`** (home strip H03-023, and `WE ARE INDEPENDENT.` for /story H03-046; same cadence as `WE DO NOT TREND.`). `NO CONVENTIONAL CHANNELS` becomes `MADE TO ORDER`, which is already a documented shop fact.

Precondition: the owner confirms "independent" is true (owner-operated by LEISSON OÜ, no outside label, publisher or investor). If the owner does not confirm it, use the register's evidence-backed `WE MAKE ORIGINAL GRAPHIC OBJECTS` for both lines. Keep the old lines verbatim only if the owner deliberately commits to never advertising.

## (f) Acceptance tests that would pin the result (list only)

1. `tests/brand/claim-register.test.mjs` passes after the register is updated in the same change: the 30 removed entries are deleted from `docs/claim-register.json`, the 22 reworded entries get their new text, the new strings get entries, and the counts line in `docs/claim-register.md` is regenerated. Entries pointing at the deleted `frequency-gate.tsx` must go (the "registered files exist" and "verbatim" tests fail otherwise).
2. A new `tests/brand/signal-journal.test.mjs`: none of these occur in `src/`: `MEMBERS ONLY`, `ACCESS GRANTED`, `ACCESS RESTRICTED`, `FREQ-GATED`, `LIVE FEED`, `DIRECT ACCESS`, `DIRECT EVENT ACCESS`, `SIGNAL NETWORK`, `ENTER SIGNAL`, `closed channel`, `closed, non-algorithmic`, `no public existence`, `140HZ`, `WE DO NOT ADVERTISE`, `NO CONVENTIONAL CHANNELS`, `before the brand existed`.
3. Same test: `frequency-gate.tsx` does not exist; no `CORRECT_CODE`; no coordinate pattern `\d+\.\d+°[NS]`; none of `NEOONDREED`, `Krematoorium`, `Field Jacket`, `SS-2025`, `Warehouse district`, `Arch 42`.
4. Same test: `/signal` source has no `<form>`, no `type="email"`, no `subscribe` or `newsletter` wording, and no signup promise (pins "no signup until a receiver exists").
5. `npm run test:http`: `/signal` returns 200, the HTML contains `NO ENTRIES YET.` and no `FREQ >` input; `/sitemap.xml` still lists `/signal`; nav and footer still link to `/signal`.
6. Metadata: `/signal` title is `Signal` and the description equals the proposed string; neither contains `network`.
7. Home: the Signal link text is `READ THE SIGNAL`, its href is `/signal`, and the home HTML contains neither `140HZ` nor `NETWORK`.
8. Post-build bundle check: no forbidden string from items 2 and 3 appears under `.next/static`.
9. `node --test tests/docs/docs-hygiene.test.mjs` (no BOM, no mojibake) and the standard gates: `npm run test:store`, `npm run test:docs`, `npm run typecheck`, `npm run lint`, `npm run build`.

## Inputs only the owner can give (not alternative decisions)

- Confirm "independent" (section e), or accept the fallback line.
- Confirm whether anything in the old feed really happened (sig-001, sig-005). Default: removed.
- Optional: a first real journal entry, supplied by the owner with a real date. Without one the page shows the empty state, and the home CTA leads to a page with no entries. That is honest, but it is the weakest part of this change.

## (g) Status

PROPOSED_NOT_APPLIED. Applying it is a separate ticket and a separate PR, after the owner approves D1 and answers the inputs above.
