# KPT Underground — Agent Development Instructions

> These instructions override defaults. Every Claude instance and subagent working on this codebase MUST read this file first.

## Project Identity

KPT Underground is a streetwear brand site: "Soundsystem Workwear for the People Who Build the Systems." CRT/terminal aesthetic — dark backgrounds, acid green accents, scanline overlays, monospace typography, custom crosshair cursor.

- **Live**: https://kpt-underground.vercel.app
- **Repo**: github.com/LEISSON-DARKSSON/kpt-underground
- **Stack**: Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS 4, Vercel
- **Deploy**: Push to `main` → Vercel auto-builds and deploys

---

## Token Efficiency Rules

These rules exist to reduce wasted tokens, prevent context bloat, and keep agents fast.

### 1. Never Re-Read What You Already Know

Before calling `Read` or `Grep`, check if the information is already in this file or in your current context. The design tokens, component tree, file paths, and conventions are all documented below. Do not re-read `globals.css`, `layout.tsx`, or `package.json` unless you suspect they have changed since this file was written.

### 2. Write Complete Files in One Pass

Do NOT scaffold a file and then edit it 3-4 times. Plan the full component in your head, then write it once. If the file is >100 lines, write in 2 passes max: structure first, then fill. Never do incremental single-line edits across 10+ tool calls.

### 3. Batch Related Operations

Wrong (5 tool calls):
```
Edit file A → Edit file B → Edit file C → Edit file D → Edit file E
```

Right (1-2 tool calls):
```
Write file A (complete) + Write file B (complete)   [parallel]
Edit file C + Edit file D                           [parallel]
```

### 4. Use Exact Paths — Never Search

Every file location is documented below. Use `@/` path alias. Never `find` or `grep` for file locations that are already mapped here.

### 5. No Explanatory Narration

Do not explain what you are about to do before doing it. Do not recap what you just did after doing it. Just do the work and report the result. The user can read diffs.

### 6. Skip Redundant Verification

After writing a component that follows established patterns in this file, do NOT immediately run `tsc --noEmit` unless you used a new pattern or dependency. Save verification for batch gates (see Verification section).

### 7. Prefer Server Components

Default to Server Components (no `'use client'`). Only add the directive when the component genuinely needs: `useState`, `useEffect`, `useRef`, event handlers (`onClick`, `onChange`), or browser APIs (`window`, `document`, `localStorage`). If a page is mostly static with one interactive widget, make the page a Server Component and extract only the interactive part as a Client Component.

---

## Architecture Map

```
kpt-underground/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── globals.css         # ALL design tokens + animations + utilities
│   │   ├── layout.tsx          # Root layout (fonts, metadata, shell components)
│   │   ├── page.tsx            # Home page (Server Component)
│   │   ├── story/page.tsx      # [Phase B] Brand story
│   │   ├── artists/page.tsx    # [Phase B] Artist fund
│   │   ├── shop/page.tsx       # [Phase C] Product grid
│   │   └── shop/[slug]/page.tsx # [Phase C] Product detail
│   ├── components/
│   │   ├── brand/              # Site-wide brand components (client)
│   │   │   ├── audio-toggle.tsx
│   │   │   ├── char-reveal.tsx
│   │   │   ├── cursor-engine.tsx
│   │   │   ├── page-loader.tsx
│   │   │   ├── scroll-reveal.tsx
│   │   │   └── ticker.tsx
│   │   ├── home/               # Home page sections
│   │   │   ├── artist-fund-preview.tsx
│   │   │   ├── hero-ctas.tsx
│   │   │   ├── hero-stats.tsx
│   │   │   ├── manifesto-strip.tsx
│   │   │   └── product-lines.tsx
│   │   ├── layout/             # Persistent layout components
│   │   │   ├── navbar.tsx      # Client (scroll detection, pathname)
│   │   │   └── footer.tsx      # Server
│   │   └── ui/                 # Reusable primitives (buttons, inputs, etc.)
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utility functions, constants, types
├── prototypes/                 # Original HTML prototypes (reference only, do NOT modify)
├── public/                     # Static assets (images, fonts, favicons)
├── vercel.json                 # Framework preset: nextjs
├── tsconfig.json               # Strict mode, @/* path alias → ./src/*
├── postcss.config.mjs          # @tailwindcss/postcss (Tailwind v4)
└── package.json                # next@16, react@19, tailwindcss@4
```

### File Conventions

| Location | Naming | Export |
|----------|--------|--------|
| `app/*/page.tsx` | `page.tsx` only | `export default function PageName()` |
| `components/**/*.tsx` | `kebab-case.tsx` | Named export: `export function ComponentName()` |
| `hooks/*.ts` | `use-kebab-case.ts` | Named export: `export function useHookName()` |
| `lib/*.ts` | `kebab-case.ts` | Named exports |

### Import Order

```tsx
// 1. React/Next.js
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// 2. Components (alphabetical by path)
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

// 3. Hooks
import { useScrollPosition } from "@/hooks/use-scroll-position";

// 4. Lib/utils
import { cn } from "@/lib/utils";

// 5. Types (type-only imports)
import type { Product } from "@/lib/types";
```

---

## Design Token Reference

### DO NOT re-read globals.css. Use these values directly:

#### Colors (Tailwind classes)

| Token | Hex | Tailwind Class | CSS Var | Usage |
|-------|-----|---------------|---------|-------|
| ink | `#050505` | `bg-ink` `text-ink` | `var(--ink)` | Primary background |
| ink-2 | `#090909` | `bg-ink-2` | `var(--ink2)` | Elevated surfaces |
| ink-3 | `#0e0e0e` | `bg-ink-3` | `var(--ink3)` | Card backgrounds |
| green | `#8ACE00` | `text-green` `bg-green` | `var(--green)` | Primary accent, CTAs, active states |
| orange | `#FF8C00` | `text-orange` `bg-orange` | `var(--orange)` | Warning, locked states |
| rust | `#A0522D` | `text-rust` `bg-rust` | `var(--rust)` | Tertiary accent |
| slate | `#708090` | `text-slate` `bg-slate` | `var(--slate)` | Secondary text, borders |
| paper | `#E8E4DC` | `text-paper` `bg-paper` | `var(--paper)` | Primary text on dark |
| muted | `#606258` | `text-muted` | `var(--muted)` | Subdued text |
| dim | `#333330` | `text-dim` `border-dim` | `var(--dim)` | Borders, dividers |

#### Typography

| Font | CSS Variable | Tailwind | Usage |
|------|-------------|----------|-------|
| Space Mono 400/700 | `var(--font-mono)` | `font-mono` | Body text, UI, code |
| Bebas Neue 400 | `var(--font-display)` | `font-display` | Headings, hero, display |

#### Easing

| Name | Value | Tailwind |
|------|-------|----------|
| Expo (smooth) | `cubic-bezier(0.16, 1, 0.3, 1)` | `ease-expo` |
| Snap (spring) | `cubic-bezier(0.34, 1.56, 0.64, 1)` | `ease-snap` |

#### Z-Index Scale

| Layer | Value | Token |
|-------|-------|-------|
| Grid | 0 | `z-grid` |
| Content | 1 | `z-content` |
| Nav | 500 | `z-nav` |
| Audio | 600 | `z-audio` |
| Cart | 700 | `z-cart` |
| Scanline | 8000 | `z-scanline` |
| Cursor | 9997 | `z-cursor` |
| Loader | 9999 | `z-loader` |

---

## Component Patterns

### New Page Template

```tsx
// src/app/{route}/page.tsx — Server Component
import { CharReveal } from "@/components/brand/char-reveal";
import { ScrollReveal } from "@/components/brand/scroll-reveal";

export default function PageName() {
  return (
    <>
      <section className="relative overflow-hidden flex items-center" style={{ minHeight: "100vh", paddingTop: "calc(80px + var(--sat))" }}>
        <div className="wrap">
          <ScrollReveal>
            <CharReveal as="h1" text="PAGE TITLE" className="font-display text-[clamp(3rem,10vw,7rem)] leading-[0.95] text-green" />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
```

### New Client Component Template

```tsx
// src/components/{category}/{name}.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface ComponentNameProps {
  // typed props — no `any`
}

export function ComponentName({ ...props }: ComponentNameProps) {
  return (
    <div data-cursor="h">
      {/* content */}
    </div>
  );
}
```

### Interactive Element Requirements

Every clickable/hoverable element MUST have:
1. `data-cursor="h"` (hover state) or `data-cursor="shop"` (shop state) or `data-cursor="lock"` (locked state)
2. `data-cursor-label="LABEL TEXT"` for shop/lock states
3. No native `cursor:` CSS — the custom cursor engine handles all states

### ScrollReveal Usage

```tsx
<ScrollReveal>              {/* Immediate reveal */}
<ScrollReveal delay={1}>    {/* 100ms stagger */}
<ScrollReveal delay={2}>    {/* 200ms stagger */}
<ScrollReveal delay={3}>    {/* 300ms stagger */}
<ScrollReveal delay={4}>    {/* 400ms stagger */}
```

### CharReveal Usage

```tsx
<CharReveal
  as="h1"                    // HTML element tag
  text="HEADING TEXT"         // Text to animate character-by-character
  className="font-display text-green text-6xl"
  accentClass="text-orange"   // Optional: color for alternate characters
/>
```

### Ticker Usage

```tsx
<Ticker
  items={["ITEM 1", "ITEM 2", "ITEM 3"]}
  speed={30}        // seconds per loop cycle
  reverse={false}   // direction
/>
```

### CSS Utility Classes (from globals.css)

| Class | Purpose |
|-------|---------|
| `.wrap` | Max-width container with horizontal padding |
| `.eyebrow` | Uppercase monospace label (11px, 0.14em tracking, green) |
| `.stmt` | Large display text (Bebas Neue, clamp sizing) |
| `.reveal` | Scroll reveal base (add `.in` when visible) |
| `.reveal-d1` to `.reveal-d4` | Stagger delays for reveal animations |

---

## Routing Plan

| Route | Status | Description |
|-------|--------|-------------|
| `/` | Done | Home page — hero, manifesto, product lines, artist fund |
| `/story` | Phase B | Brand narrative, origin story, mission |
| `/artists` | Phase B | Artist fund recipients, fund mechanics |
| `/shop` | Phase C | Product grid, filtering, cart |
| `/shop/[slug]` | Phase C | Product detail page |
| `/signal` | Phase D | Community signal network |

---

## Git & Deploy Workflow

### Commit Convention

```
<type>: <short description>

<body — what and why, not how>

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `refactor`, `style`, `docs`, `chore`, `perf`, `test`

### Deploy Pipeline

1. Write code in sandbox (`/sessions/*/kpt-next/`)
2. Copy to mounted workspace (`/sessions/*/mnt/KEEPITUNDERGROUND/kpt-underground/`)
3. Use Desktop Commander + Git Bash to commit and push:
   - Shell: `C:\\Program Files\\Git\\bin\\bash.exe`
   - Repo path: `/c/Users/gert/Desktop/KEEPITUNDERGROUND/kpt-underground`
4. Vercel auto-deploys from `main`

### Git Bash Command Template

```
cd /c/Users/gert/Desktop/KEEPITUNDERGROUND/kpt-underground && git add <files> && git commit -m "<message>" && git push origin main
```

---

## Verification Gates

Run these ONLY at phase boundaries or before deploy, not after every edit:

```bash
# Gate 1: Build
npm run build

# Gate 2: TypeScript
npm run typecheck   # alias for tsc --noEmit

# Gate 3: Lint
npm run lint
```

### When to Skip Verification

- Adding a new page that follows the template above → skip, verify at phase end
- Modifying existing component logic → run typecheck only
- Changing styles/CSS only → skip all gates
- Adding new dependency → run build

### When to Always Verify

- Before any git push
- After modifying `tsconfig.json`, `postcss.config.mjs`, `next.config.ts`
- After adding/removing dependencies
- After modifying `layout.tsx` or `globals.css`

---

## Anti-Patterns — Never Do These

| Anti-Pattern | Why | Instead |
|---|---|---|
| `console.log()` in components | Ships to production | Remove all or use conditional dev-only logging |
| `any` type | Defeats TypeScript | Define proper interfaces |
| `useEffect` for derived state | Causes extra renders | Compute during render |
| Inline styles for colors/fonts | Breaks design system | Use Tailwind classes or CSS vars |
| `cursor: pointer` CSS | Custom cursor engine active | Use `data-cursor` attributes |
| Re-reading this file's info | Wastes tokens | Reference from context |
| Explaining before acting | Wastes tokens | Just do it |
| Multiple small edits | Wastes tool calls | Write complete files |
| `React.FC` type | Deprecated pattern | Use typed props directly |
| Default exports for components | Hard to refactor | Named exports only |
| Barrel files (`index.ts`) | Breaks tree shaking | Import from exact file path |
| `'use client'` on pages | Kills SSR benefits | Extract interactive parts only |

---

## Agent Delegation Guide

When spawning subagents, include this context in the prompt:

```
PROJECT: KPT Underground — Next.js 16, React 19, Tailwind 4, TypeScript strict
PATH ALIAS: @/* → ./src/*
DESIGN: Dark CRT aesthetic. Colors: green=#8ACE00, orange=#FF8C00, paper=#E8E4DC on ink=#050505
FONTS: Space Mono (body), Bebas Neue (headings)
CURSOR: Custom engine — use data-cursor attributes, never CSS cursor
READ CLAUDE.md at: /sessions/nifty-awesome-ptolemy/mnt/KEEPITUNDERGROUND/kpt-underground/CLAUDE.md
```

---

## Quick Reference: New Feature Checklist

1. Create route: `src/app/{route}/page.tsx` (Server Component)
2. Create sections: `src/components/{route}/{section-name}.tsx`
3. Wire interactive parts with `"use client"` only where needed
4. Add `data-cursor` attributes to all interactive elements
5. Wrap sections in `<ScrollReveal>` with stagger delays
6. Use `<CharReveal>` for animated headings
7. Use design tokens from the table above — never hardcode colors
8. Add route to `<Navbar>` links array in `src/components/layout/navbar.tsx`
9. Copy files to mounted workspace
10. Git commit + push via Desktop Commander Git Bash
