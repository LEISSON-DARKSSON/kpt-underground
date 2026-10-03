# KPT UNDERGROUND — COMPREHENSIVE DEVELOPMENT PLAN

**Classification:** `KPT-UG-DEV-001 // DEVELOPMENT ROADMAP // V1.0`
**Date:** 2026-03-22
**Repository:** `github.com/LEISSON-DARKSSON/kpt-underground`
**Vercel Team:** `leisson-creative` (`team_AM95AHo0HzxOqVMyK8uCsfKw`)

---

## 1. CURRENT STATE AUDIT

### 1.1 Repository Status

| Metric | Value |
|--------|-------|
| **Commits** | 1 (`fb72ada`) |
| **Branch** | `main` |
| **Files** | 12 standalone HTML prototypes |
| **Total size** | ~1.1 MB |
| **Build system** | None (raw HTML) |
| **Package manager** | None |
| **Framework** | None (vanilla HTML/CSS/JS + 1 bundled React SPA) |
| **Tests** | None |
| **CI/CD** | Vercel auto-deploy from GitHub (3 projects connected) |

### 1.2 File Inventory

| File | Purpose | Size | Completeness |
|------|---------|------|-------------|
| `kpt-underground-brand-bible.html` | Design system documentation | 80 KB | 100% |
| `kpt-underground-home.html` | Landing / marketing page | 76 KB | 100% |
| `kpt-underground-shop.html` | Product collection / catalog | 72 KB | 95% |
| `kpt-underground-pdp.html` | Product detail page | 75 KB | 95% |
| `kpt-underground-confirmation.html` | Order confirmation | 50 KB | 100% |
| `kpt-underground-editorial.html` | Artist fund / editorial | 48 KB | 90% |
| `kpt-underground-story.html` | Brand narrative v1 | 48 KB | 90% |
| `kpt-underground-story-v2.html` | Brand narrative v2 (refined) | 34 KB | 90% |
| `kpt-underground-phase1.html` | Phase 1 — Foundation | 62 KB | 100% |
| `kpt-underground-phase2.html` | Phase 2 — Expansion | 53 KB | 100% |
| `kpt-underground-phase3.html` | Phase 3 — Full implementation | 88 KB | 100% |
| `kpt-underground-react-app.html` | Bundled React SPA (all pages) | 465 KB | 85% |

### 1.3 Vercel Deployment Status

| Project | ID | Status | Notes |
|---------|----|--------|-------|
| `kpt-underground` | `prj_YJhnEFeOnrCoodkZ9k201ReLeGfq` | **READY** | Production deployment live |
| `keepitunderground` | `prj_YiwBUxtOlfE4p3v0quhRydqfogiL` | **ERROR** | Build failed — no framework config |
| `keepitunderground-web` | `prj_pPwi7ej52K9FqefjohaLS1kDDL63` | **ERROR** | Build failed — no framework config |

**Root cause of failures:** The 2 errored projects expect a framework (Next.js) but the repo contains only raw HTML files. The working deployment (`kpt-underground`) is likely configured for static file serving.

### 1.4 Design System (Extracted from Brand Bible + Prototypes)

**Color Tokens:**
```
--ink:    #050505    (primary background)
--ink2:   #0b0b0b    (secondary background)
--ink3:   #0f0f0f    (tertiary background)
--green:  #8ACE00    (primary accent — acid lime)
--orange: #FF8C00    (secondary accent — warn)
--rust:   #A0522D    (tertiary accent)
--slate:  #708090    (muted blue-gray)
--paper:  #E8E4DC    (primary text — off-white)
--muted:  #666860    (secondary text)
--dim:    #333330    (disabled/inactive)
```

**Typography:**
- Display: `Bebas Neue` (uppercase headers, letter-spacing 0.2-0.5em)
- Body: `Space Mono` (monospace, all UI text)

**Motion:**
- `--fast`: 80ms | `--respond`: 160ms | `--cinema`: 800ms
- `--ease-out`: cubic-bezier(0.16, 1, 0.3, 1)
- `--ease-snap`: cubic-bezier(0.34, 1.56, 0.64, 1)

**Signature Effects:**
- Scanline overlay (repeating-linear-gradient)
- 52px grid background
- Custom crosshair cursor with ring + label
- Character-by-character text reveal
- CRT terminal aesthetic

### 1.5 Strengths

1. **Exceptional brand identity** — cohesive, memorable, deeply considered visual language
2. **Strong design tokens** — well-defined colors, timing, easing across all prototypes
3. **Rich interaction design** — cursor engine, scroll reveals, audio system, terminal UX
4. **Complete page set** — every major e-commerce page prototyped
5. **Phase documentation** — clear evolutionary roadmap in phase files
6. **Bundled React SPA** — proof-of-concept exists with Zustand, 8 routes, full cart

### 1.6 Critical Gaps

1. **No build system** — raw HTML, no bundling, no tree-shaking, no optimization
2. **No component library** — every page duplicates cursor, nav, loader, audio, cart code
3. **No routing** — pages are standalone files, not an app
4. **No backend** — all data is hardcoded, no CMS, no payments, no auth persistence
5. **No tests** — zero coverage
6. **No accessibility** — `cursor: none` everywhere, no ARIA, no semantic HTML, no `prefers-reduced-motion`
7. **No SEO** — single-file HTML has no meta, no OG tags, no structured data
8. **2 of 3 Vercel projects failing** — framework mismatch

---

## 2. ARCHITECTURE DECISION: NEXT.JS APP ROUTER

### 2.1 Why Next.js

The prototypes are production-quality in design but need a real framework to become a shippable product. Next.js App Router is the right choice because:

- **Server Components** — heavy brand pages (story, editorial) can be SSR/SSG with zero client JS
- **App Router** — route groups map perfectly to KPT's page structure
- **Image optimization** — product images need `next/image` for LCP
- **Vercel-native** — already deployed there, zero config
- **ISR** — artist fund data and product catalog can revalidate without full rebuilds
- **Middleware** — Signal Network auth gating at the edge

### 2.2 Proposed Route Structure

```
app/
├── (marketing)/                 # Public brand pages
│   ├── layout.tsx               # Shared nav + audio + cursor
│   ├── page.tsx                 # Home (from home.html)
│   ├── story/page.tsx           # Brand narrative (from story-v2.html)
│   └── editorial/page.tsx       # Artist fund (from editorial.html)
│
├── (shop)/                      # E-commerce pages
│   ├── layout.tsx               # Shared nav + cart drawer
│   ├── page.tsx                 # Shop catalog (from shop.html)
│   ├── [productSlug]/page.tsx   # PDP (from pdp.html)
│   └── confirmation/page.tsx    # Order confirmation (from confirmation.html)
│
├── (signal)/                    # Signal Network (gated)
│   ├── layout.tsx               # Auth-gated layout
│   └── page.tsx                 # Terminal interface
│
├── api/
│   ├── cart/route.ts            # Cart operations
│   ├── signal/auth/route.ts     # Signal authentication
│   └── webhooks/
│       └── stripe/route.ts      # Payment webhooks
│
├── layout.tsx                   # Root: fonts, metadata, providers
├── globals.css                  # Design tokens + base styles
└── not-found.tsx                # Custom 404
```

### 2.3 Component Architecture

```
components/
├── ui/                          # Atomic design primitives
│   ├── button.tsx
│   ├── badge.tsx
│   ├── card.tsx
│   ├── drawer.tsx
│   ├── toast.tsx
│   └── ticker.tsx
│
├── brand/                       # KPT-specific branded components
│   ├── cursor-engine.tsx        # Custom crosshair cursor system
│   ├── audio-toggle.tsx         # Sound system with waveform bars
│   ├── scanline-overlay.tsx     # CRT scanline effect
│   ├── grid-background.tsx      # 52px grid pattern
│   ├── page-loader.tsx          # Brand loading animation
│   ├── char-reveal.tsx          # Character-by-character text
│   └── glint-row.tsx            # Product line glint effect
│
├── layout/                      # Structural components
│   ├── navbar.tsx               # Navigation with live indicator
│   ├── footer.tsx
│   ├── section.tsx              # Scroll-reveal wrapper
│   └── wrap.tsx                 # Content width containers
│
├── shop/                        # E-commerce components
│   ├── product-card.tsx
│   ├── product-grid.tsx
│   ├── cart-drawer.tsx
│   ├── checkout-panel.tsx
│   ├── spec-table.tsx
│   └── price-display.tsx
│
├── artists/                     # Artist fund components
│   ├── artist-card.tsx
│   ├── artist-grid.tsx
│   ├── fund-display.tsx
│   └── region-filter.tsx
│
└── signal/                      # Signal Network components
    ├── terminal.tsx
    ├── manifesto-list.tsx
    └── access-gate.tsx
```

---

## 3. DEVELOPMENT PHASES

### PHASE A: Foundation (Weeks 1–2)
**Goal:** Scaffold Next.js project, extract design system, deploy skeleton

| # | Task | Priority | Effort |
|---|------|----------|--------|
| A1 | Initialize Next.js 15 App Router with TypeScript strict mode | Critical | 2h |
| A2 | Configure Tailwind CSS with full KPT design tokens from brand bible | Critical | 3h |
| A3 | Set up Google Fonts (Space Mono + Bebas Neue) via `next/font` | Critical | 1h |
| A4 | Create `globals.css` with all CSS custom properties, scanline overlay, grid background | Critical | 2h |
| A5 | Build `CursorEngine` client component (crosshair + ring + label + states) | High | 4h |
| A6 | Build `AudioToggle` client component (5-bar waveform, sound effects) | High | 3h |
| A7 | Build `PageLoader` component (brand loading animation) | High | 2h |
| A8 | Build `Navbar` with logo, navigation links, live indicator | High | 3h |
| A9 | Build `Footer` component | Medium | 1h |
| A10 | Build `ScrollReveal` wrapper (Intersection Observer, stagger) | High | 2h |
| A11 | Build `CharReveal` text animation component | Medium | 2h |
| A12 | Build `Ticker` marquee component (multi-track, bidirectional) | Medium | 2h |
| A13 | Configure Vercel project — consolidate to single `kpt-underground` project | Critical | 1h |
| A14 | Set up ESLint + Prettier + TypeScript strict | High | 1h |
| A15 | Add `prefers-reduced-motion` media query support to all animations | High | 2h |

**Deliverable:** Empty shell app deploys to Vercel with design system, cursor, audio, and nav working.

### PHASE B: Marketing Pages (Weeks 3–4)
**Goal:** Port all brand/marketing pages to Next.js

| # | Task | Priority | Effort |
|---|------|----------|--------|
| B1 | Build Home page — hero, artist fund, ticker, philosophy, collection preview | Critical | 8h |
| B2 | Build Story page — brand narrative, product lines, equipment grid | High | 6h |
| B3 | Build Editorial page — artist grid, fund overview, quarterly history | High | 6h |
| B4 | Add SEO metadata (OG tags, structured data, meta descriptions) per page | High | 3h |
| B5 | Implement responsive breakpoints (375px, 768px, 1024px, 1440px) | Critical | 4h |
| B6 | Add semantic HTML (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) | High | 2h |
| B7 | Add ARIA labels and roles to all interactive elements | High | 3h |
| B8 | Optimize images with `next/image` (product shots, artist avatars) | High | 2h |

**Deliverable:** All brand pages live, SSG with perfect Lighthouse scores.

### PHASE C: E-Commerce (Weeks 5–7)
**Goal:** Full shopping experience with cart, checkout, and payments

| # | Task | Priority | Effort |
|---|------|----------|--------|
| C1 | Set up Zustand store for cart state (items, quantities, totals) | Critical | 3h |
| C2 | Build Shop page — product grid, filtering, cursor price display | Critical | 6h |
| C3 | Build PDP — blueprint assembly, spec table, size selector, add to cart | Critical | 8h |
| C4 | Build CartDrawer — slide-in, item management, totals | Critical | 4h |
| C5 | Build CheckoutPanel — shipping form, payment integration | Critical | 8h |
| C6 | Build Confirmation page — terminal animation, order summary | High | 4h |
| C7 | Integrate Stripe Checkout or Stripe Elements | Critical | 8h |
| C8 | Build product data layer (CMS or JSON/MDX for MVP) | High | 4h |
| C9 | Add toast notification system | Medium | 2h |
| C10 | Implement cart persistence (cookies or Zustand persist) | High | 2h |
| C11 | Add Zod validation for all form inputs | High | 3h |

**Deliverable:** Complete purchase flow from browse → cart → checkout → confirmation.

### PHASE D: Signal Network (Week 8)
**Goal:** Gated community access system

| # | Task | Priority | Effort |
|---|------|----------|--------|
| D1 | Build Signal access gate (140HZ unlock mechanism) | High | 4h |
| D2 | Build Terminal interface (command-line style UI) | High | 4h |
| D3 | Build Manifesto list component | Medium | 2h |
| D4 | Implement access state persistence (JWT cookie or session) | High | 3h |
| D5 | Purchase-triggered access (order confirmation → Signal unlock) | High | 3h |
| D6 | Edge middleware for Signal route protection | High | 2h |

**Deliverable:** Signal Network accessible via purchase or 140HZ code.

### PHASE E: Quality & Performance (Week 9)
**Goal:** Production hardening

| # | Task | Priority | Effort |
|---|------|----------|--------|
| E1 | Lighthouse audit — target 95+ across all categories | Critical | 4h |
| E2 | Add `prefers-color-scheme` support (system theme detection) | Medium | 2h |
| E3 | Keyboard navigation audit (tab order, focus management) | High | 3h |
| E4 | Color contrast audit (WCAG AA 4.5:1 minimum) | High | 2h |
| E5 | Bundle analysis — identify and eliminate dead code | High | 2h |
| E6 | Add error boundaries to all route segments | High | 2h |
| E7 | Implement loading.tsx and error.tsx for each route group | High | 2h |
| E8 | Mobile device testing (iOS Safari, Android Chrome) | Critical | 4h |
| E9 | Safe area inset testing (notched devices) | High | 1h |
| E10 | Set up Vitest + React Testing Library | High | 4h |
| E11 | Write component tests for cart, checkout, signal auth | High | 6h |

**Deliverable:** Production-grade, accessible, performant, tested application.

### PHASE F: CMS & Scalability (Week 10+)
**Goal:** Content management and growth infrastructure

| # | Task | Priority | Effort |
|---|------|----------|--------|
| F1 | Evaluate headless CMS (Sanity, Payload, or Contentful) | Medium | 4h |
| F2 | Migrate product data to CMS | Medium | 6h |
| F3 | Migrate artist fund data to CMS | Medium | 4h |
| F4 | Set up ISR for product and artist pages | Medium | 2h |
| F5 | Add analytics (Vercel Analytics or Plausible) | Medium | 2h |
| F6 | Set up monitoring (Sentry or Vercel's error tracking) | Medium | 2h |
| F7 | Domain configuration (keepitunderground.com or similar) | Medium | 1h |

---

## 4. AUTONOMOUS WORKFLOW: GITHUB → VERCEL PIPELINE

### 4.1 Connected Infrastructure

```
GitHub Repo                    Vercel Project
────────────────              ─────────────────
LEISSON-DARKSSON/             kpt-underground
kpt-underground          ──→  (prj_YJhnEFeOnrCoodkZ9k201ReLeGfq)
  branch: main                Auto-deploy: ON
                              Team: leisson-creative
```

### 4.2 Branch Strategy

```
main ─────────────────────────────── Production (Vercel auto-deploys)
  │
  ├── dev ────────────────────────── Integration branch (Preview deploys)
  │     │
  │     ├── feat/foundation ──────── Phase A work
  │     ├── feat/marketing-pages ─── Phase B work
  │     ├── feat/ecommerce ───────── Phase C work
  │     ├── feat/signal-network ──── Phase D work
  │     └── feat/quality-pass ────── Phase E work
  │
  └── hotfix/* ───────────────────── Emergency fixes → main
```

### 4.3 Autonomous Execution Flow

Each development phase follows this pipeline:

```
┌─────────────────────────────────────────────────────────┐
│  1. BRANCH                                              │
│     git checkout -b feat/<phase-name> dev                │
├─────────────────────────────────────────────────────────┤
│  2. IMPLEMENT                                           │
│     Build components, pages, tests per phase tasks       │
│     Run: npx tsc --noEmit (type check)                   │
│     Run: npx next lint (lint check)                      │
│     Run: npx vitest run (test suite)                     │
├─────────────────────────────────────────────────────────┤
│  3. COMMIT                                              │
│     git add <specific files>                             │
│     git commit -m "feat: <description>"                  │
│     Conventional commits: feat|fix|refactor|docs|test    │
├─────────────────────────────────────────────────────────┤
│  4. PUSH                                                │
│     git push -u origin feat/<phase-name>                 │
│     → Triggers Vercel Preview Deployment automatically   │
├─────────────────────────────────────────────────────────┤
│  5. VERIFY                                              │
│     Check Vercel deployment status (READY / ERROR)       │
│     Review preview URL for visual correctness            │
│     Run Lighthouse on preview deployment                 │
├─────────────────────────────────────────────────────────┤
│  6. MERGE → DEPLOY                                      │
│     Create PR: feat/<phase-name> → dev                   │
│     On merge to dev: Vercel preview deployment           │
│     When phase complete: PR dev → main                   │
│     On merge to main: Vercel production deployment       │
└─────────────────────────────────────────────────────────┘
```

### 4.4 Vercel Cleanup

**Action required:** Delete the 2 errored projects to avoid confusion:
- `keepitunderground` (prj_YiwBUxtOlfE4p3v0quhRydqfogiL) — ERROR
- `keepitunderground-web` (prj_pPwi7ej52K9FqefjohaLS1kDDL63) — ERROR

**Keep:** `kpt-underground` (prj_YJhnEFeOnrCoodkZ9k201ReLeGfq) — this is the working production deployment.

### 4.5 Environment Variables (Vercel)

```
# Required for Phase C (E-Commerce)
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Required for Phase D (Signal Network)
SIGNAL_JWT_SECRET=<random-32-chars>

# Required for Phase F (CMS)
SANITY_PROJECT_ID=...
SANITY_DATASET=production
SANITY_API_TOKEN=...

# Analytics (Phase F)
NEXT_PUBLIC_ANALYTICS_ID=...
```

---

## 5. TECH STACK SPECIFICATION

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js (App Router) | 15.x | SSR/SSG, routing, API routes |
| Language | TypeScript | 5.x | Type safety, strict mode |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| Fonts | next/font (Google) | — | Space Mono + Bebas Neue |
| State | Zustand | 5.x | Cart, UI, Signal auth |
| Validation | Zod | 3.x | Form + API input validation |
| Payments | Stripe | — | Checkout, webhooks |
| Testing | Vitest + RTL | — | Unit + component tests |
| Linting | ESLint + Prettier | — | Code quality |
| Deploy | Vercel | — | CI/CD, edge, analytics |
| Icons | Lucide React | — | UI iconography |
| CMS | TBD (Sanity recommended) | — | Product + artist content |

---

## 6. DESIGN TOKEN → TAILWIND MAPPING

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:    { DEFAULT: '#050505', 2: '#0b0b0b', 3: '#0f0f0f' },
        green:  { DEFAULT: '#8ACE00' },
        orange: { DEFAULT: '#FF8C00' },
        rust:   { DEFAULT: '#A0522D' },
        slate:  { DEFAULT: '#708090' },
        paper:  { DEFAULT: '#E8E4DC' },
        muted:  { DEFAULT: '#666860' },
        dim:    { DEFAULT: '#333330' },
      },
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        mono:    ['var(--font-space-mono)', 'monospace'],
      },
      transitionDuration: {
        fast:    '80ms',
        respond: '160ms',
        cinema:  '800ms',
      },
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'snap':          'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      backgroundSize: {
        grid: '52px 52px',
      },
      zIndex: {
        grid:    '0',
        content: '10',
        nav:     '500',
        audio:   '600',
        toast:   '700',
        cart:    '800',
        loader:  '9999',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

---

## 7. RISK REGISTER

| Risk | Impact | Likelihood | Mitigation |
|------|--------|-----------|-----------|
| Custom cursor breaks accessibility | High | Certain | Add `prefers-reduced-motion` fallback, visible focus rings, keyboard nav |
| 465KB React SPA not portable to Next.js | Medium | Medium | Use as reference only, rebuild components from scratch |
| Stripe integration complexity | Medium | Medium | Start with Stripe Checkout (hosted), upgrade to Elements later |
| Token inconsistencies across prototype files | Low | Certain | Use brand bible as single source of truth, ignore per-page variations |
| Mobile layout issues (no media queries in prototypes) | Medium | High | Build mobile-first from scratch, use prototypes as desktop reference |
| 2 broken Vercel projects cause deploy confusion | Low | High | Delete errored projects immediately |

---

## 8. IMMEDIATE NEXT ACTIONS

1. **Clean up Vercel** — delete `keepitunderground` and `keepitunderground-web` projects
2. **Create `dev` branch** from `main` on GitHub
3. **Scaffold Next.js 15** — `npx create-next-app@latest` with TypeScript + Tailwind + App Router
4. **Wire design tokens** into `tailwind.config.ts` and `globals.css`
5. **Extract CursorEngine** as the first client component (it's the brand signature)
6. **Push to `feat/foundation`** → verify Vercel preview deployment
7. **Iterate through phases A → F** following the autonomous pipeline

---

*This plan transforms 12 brilliant HTML prototypes into a production Next.js application while preserving every pixel of KPT Underground's identity. The brand is exceptional — it just needs engineering infrastructure to ship.*
