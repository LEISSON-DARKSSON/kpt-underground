# KEEP IT UNDERGROUND — Agent Instructions

> Read this file first. It overrides defaults for every Codex/Codex instance and subagent working in this repo.
> Last verified against `main` @ febac3d + branch `feat/shop-buyability-20261002` (2026-10-02).

## Project identity

KEEP IT UNDERGROUND (KPT) is a streetwear / studio-goods brand: "Soundsystem Workwear for the People Who Build the Systems." Dark CRT/terminal aesthetic — ink backgrounds, acid green + orange accents, scanlines, monospace type, custom crosshair cursor.

| | |
|---|---|
| Live site | https://keepitunderground.com (Vercel project `kpt-underground`, team `team_AM95AHo0HzxOqVMyK8uCsfKw`) |
| Repo | github.com/LEISSON-DARKSSON/kpt-underground |
| Stack | Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4 |
| Commerce | Fourthwall shop `keepitunderground` (`sh_1f2e8f65-2b29-4be9-9167-7f42314361fb`), Storefront API, USD, hosted checkout at `keepitunderground-shop.fourthwall.com` |
| Owner | Gert Leisson (LEISSON OÜ). Owner-facing replies in Estonian. |

Out of scope until the owner says otherwise: artist-fund pages/topics, background audio (removed in PR #5 — do not re-add), Stripe or any self-hosted payment.

## Hard rules

- **No orders, payments, samples or shop credit.** Verification stops at the hosted checkout page (HTTP 200).
- **Never print, log or commit the Storefront token** (`FOURTHWALL_STOREFRONT_TOKEN`). QA scripts get it through `C:\PROJECTS\kpt-underground-qa\with-token.ps1` for one run only.
- **Product visibility is the owner's call.** New products go Hidden → Private. Public only on an explicit owner command naming the products.
- **If a permission classifier denies an action, stop and report it.** Do not route around it.
- **Clicking Save is not verification.** Re-read the admin page, the Storefront API or the live site.
- **Listing copy uses supplier catalog facts + handoff copy only.** No concept-board claims (insulated, waterproof, premium…).

## Architecture

```
src/
├── app/
│   ├── layout.tsx, globals.css, page.tsx      # shell, ALL design tokens, home (Studio picks)
│   ├── shop/page.tsx                          # live catalog (ISR 60 s); client filters via ?category/q/sort
│   ├── shop/[slug]/page.tsx + error.tsx       # product detail; 404 only for non-public, 5xx + retry for upstream faults
│   ├── help/page.tsx                          # shipping/returns/contact summary → links to Fourthwall policy pages
│   ├── sitemap.ts, robots.ts                  # public canonical URLs only
│   ├── story/page.tsx, signal/page.tsx        # brand pages
│   ├── api/cart/checkout/route.ts             # POST → validates lines → Fourthwall cart → checkout URL (409 PRICE_CHANGED)
│   ├── api/fourthwall/status/route.ts         # opt-in diagnostic (FOURTHWALL_READONLY_ENABLED)
│   └── commerce-preview/…                     # legacy desk-mat preview (gated, reference only)
├── components/
│   ├── brand/      char-reveal, cursor-engine, page-loader (home only, CSS-timed), scroll-reveal, ticker
│   ├── store/      shop-catalog, product-card, product-grid, product-purchase, product-gallery, add-to-cart
│   ├── layout/     navbar (HOME / SHOP / STORY / SIGNAL), footer (+ help + Fourthwall policy links)
│   ├── home/ story/ signal/ commerce/
├── lib/
│   ├── store/core.ts          # pure: normalize, parseCatalogPage, choiceKind, galleryFor, fitStatus, checkout validation
│   ├── store/cart-model.ts    # pure cart rules (storage parsing, 20-line / 10-qty limits, price reconcile)
│   ├── store/merchandising.ts # offer-id → category/type, Studio picks, search/sort (presentation only)
│   ├── store/seo.ts, store/policies.ts
│   ├── store/fourthwall.ts    # Storefront fetch; getProducts({ fresh? }); StoreUnavailableError vs null (=404)
│   ├── store/cart.tsx         # client cart state + drawer
│   ├── analytics.ts           # dataLayer adapter only (no vendor script, no purchase event)
│   └── fourthwall-storefront.ts, utils.ts
tests/
├── store/store-core.test.mjs, store-contract.test.mjs   # unit + contract tests; fixture = real public catalog snapshot
├── store/fixtures/public-catalog-2026-10-02.json
├── e2e/http-contract.mjs      # npm run test:http — builds + starts against a mock Fourthwall, checks real HTTP statuses
├── e2e/browser-qa.mjs         # Playwright buy journey at 320/390/768/1440 (needs PLAYWRIGHT_MODULE, CHROMIUM_PATH)
├── fourthwall/storefront.test.mjs     # read-only client (mocked)
└── commerce-preview/…
```

### Commerce flow (do not break)

1. `/shop` and `/shop/[slug]` read `collections/all/products` via `getProducts()` (60 s ISR + data cache). New Public products appear on the site within ~1 minute.
2. Checkout posts lines to `/api/cart/checkout`. `validateAgainstCatalog` checks them against the cached catalog and, **once**, against a fresh (`no-store`) read if the error is `UNKNOWN_VARIANT` / `VARIANT_UNAVAILABLE` (a product published seconds ago). Other errors are not retried.
3. The route creates a Fourthwall cart and returns the hosted checkout URL. Prices always come from Fourthwall, never from the client.
4. `sortProducts` ranks only `*-desk-mat` slugs first (regex `/-desk-mat$/`).
5. Size/model products start with **no** variant selected; the chosen variant drives gallery, price and cart line. Fit text comes from Fourthwall `additionalInformation` (SIZE_AND_FIT) — never generate measurements.
6. Product pages must be able to answer 404/5xx: keep `htmlLimitedBots: /.*/` in `next.config.ts` and **no** `loading.tsx` above `/shop/[slug]` (a loading boundary streams a 200 first — soft 404 seen live 2026-10-02).
7. A checkout redirect is not a purchase. Never emit `purchase` from the browser; never empty the cart on redirect.

### Environment

| Variable | Where | Purpose |
|---|---|---|
| `FOURTHWALL_STOREFRONT_TOKEN` | Vercel (Production + Preview) | Storefront API token — secret, never logged |
| `FOURTHWALL_EXPECTED_SHOP_ID` | Vercel | Guards against a token for the wrong shop |
| `FOURTHWALL_READONLY_ENABLED` | Vercel | Enables `/api/fourthwall/status` diagnostic only |
| `FOURTHWALL_STOREFRONT_API_BASE` | tests only | Loopback mock base (`http://127.0.0.1:<port>/`); any other value is ignored |

## Conventions

- Server Components by default; `"use client"` only for state, effects, handlers or browser APIs. Pages stay server-side; extract the interactive part.
- Files `kebab-case.tsx`, named exports, `@/*` alias → `./src/*`, no barrel files, no `any`, no `React.FC`.
- Every interactive element gets `data-cursor="h" | "shop" | "lock"` (+ `data-cursor-label`). Never CSS `cursor:`.
- Import order: React/Next → components → hooks → lib → types.
- Write complete files in one pass; batch related edits; no narration before acting.

## Design tokens (do not re-read globals.css)

| Token | Hex | Tailwind | Use |
|---|---|---|---|
| ink / ink-2 / ink-3 | `#050505` / `#090909` / `#0e0e0e` | `bg-ink` … | backgrounds, surfaces, cards |
| green | `#8ACE00` | `text-green` `bg-green` | primary accent, CTAs |
| orange | `#FF8C00` | `text-orange` | warning, locked |
| rust | `#A0522D` | `text-rust` | tertiary |
| slate | `#708090` | `text-slate` | secondary text, borders |
| paper | `#E8E4DC` | `text-paper` | text on dark |
| muted / dim | `#606258` / `#333330` | `text-muted` `border-dim` | subdued text, dividers |

Fonts: Space Mono 400/700 (`font-mono`, body/UI), Bebas Neue (`font-display`, headings). Easing: `ease-expo` `cubic-bezier(0.16,1,0.3,1)`, `ease-snap` `cubic-bezier(0.34,1.56,0.64,1)`.
Z-index: grid 0 · content 1 · nav 500 · cart 700 · scanline 8000 · cursor 9997 · loader 9999 (`z-audio` was removed).
Utilities: `.wrap` `.eyebrow` `.stmt` `.reveal` (+`.in`, `.reveal-d1…d4`). Components: `<ScrollReveal delay={0-4}>`, `<CharReveal as text className accentClass>`, `<Ticker items speed reverse>`.

Product artwork palette (print files): background `#0B0C0C`, paper `#EBE7DF`, orange `#E36F48`, greys `#181B1B` / `#2A2D2D` / `#5E6663`; Bebas Neue + Space Mono.

## Workflow

1. Branch from `origin/main` (`feat/…`, `fix/…`, `docs/…`). `main` is checked out in the `C:\PROJECTS\kpt-underground` worktree; work in `C:\PROJECTS\kpt-underground-live` or another worktree.
2. Gates before every push:
   ```
   npm run test:store      # unit + contract tests (real-catalog fixture)
   npm run test:docs       # AGENTS.md + docs/*.md: no BOM/mojibake, no stale instructions
   npm run typecheck
   npm run lint
   npm run build
   npm run test:http       # store/route changes: real HTTP statuses against a mock Fourthwall (~2 min)
   ```
3. Open a PR (`gh pr create`). Merging to `main` deploys production on Vercel — merge only when the owner asked for it.
4. After merge, verify live: `/shop` card count, product pages 200, checkout API 200 (see `docs/store-operations.md`).
5. Commit messages: `<type>(scope): summary` + body (what/why). Types: feat, fix, refactor, style, docs, chore, perf, test. No BOM in commit message files.

## Products and the store

Creating, placing and publishing Fourthwall products is an admin-UI workflow, not code. Follow the `fourthwall-product-create` skill and `docs/store-operations.md` (catalog, QA scripts, placement rules, Printful-designer steps, publish checklist). Report each batch in `C:\PROJECTS\kpt-underground\execution-report.md` + a new key in `execution-record.json`.

## Automation rule

If a manual check or fix happens a second time, turn it into a script or test (prefer `tests/store/*` or a QA script in `C:\PROJECTS\kpt-underground-qa`) instead of repeating it.
