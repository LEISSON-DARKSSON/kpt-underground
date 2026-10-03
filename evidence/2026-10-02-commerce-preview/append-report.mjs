// Appends one new check entry to the owner's execution-record.json / execution-report.md, keeping all prior content.
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
const dir = "C:/PROJECTS/kpt-underground/";
const ev = "evidence/2026-10-02-commerce-preview/";
const entry = {
  checkedAt: "2026-10-01T23:00:00Z",
  checkedAtLocal: "2026-10-02 ~01:05–02:00 Europe/Tallinn",
  scope: "Commerce design preview (feature branch + protected Vercel Preview). Not a sale, checkout, order or payment.",
  result: "PARTIAL",
  resultReason: "Design preview (prototype + React port) PASS on protected Preview; Fourthwall theme draft BLOCKED (no isolated unpublished draft); full-repo lint FAIL on 12 pre-existing errors outside the new code.",
  repository: "LEISSON-DARKSSON/kpt-underground",
  baseSha: "99d224189757db3fad1882085fe43f7ff6508ccf",
  branch: "feat/commerce-design-parity-20261002",
  commits: [
    "93f26895ac4a7f39959ef2f64e26925572960719",
    "1985fe22cbaae5eb1b427378aba053887bd83ce7",
    "5fc21189c87ff561d7ba959b819b7947d38168cc",
    "e7c7f69009ccb7c0978e06410cd647b31ec90b39",
  ],
  headSha: "e7c7f69009ccb7c0978e06410cd647b31ec90b39",
  worktree: "C:/PROJECTS/kpt-underground-commerce (git worktree; owner's main checkout and untracked files untouched)",
  team: "leisson-creative", teamId: "team_AM95AHo0HzxOqVMyK8uCsfKw",
  project: "kpt-underground", projectId: "prj_YJhnEFeOnrCoodkZ9k201ReLeGfq",
  deployment: {
    id: "dpl_BYQ3sbxRCWo17TBMqJwT6Xn2GANd",
    url: "https://kpt-underground-5iqbh90k6-leisson-creative.vercel.app",
    target: "preview", state: "READY", sha: "e7c7f69009ccb7c0978e06410cd647b31ec90b39",
    prototypeRoute: "/commerce-preview",
    reactRoutes: ["/commerce-preview/shop", "/commerce-preview/shop/signal-01", "/commerce-preview/shop/subsurface-02", "/commerce-preview/shop/handoff"],
    unauthenticatedResponse: "302 to Vercel SSO (Deployment Protection active, ssoProtection all_except_custom_domains)",
  },
  productionChecks: { "https://keepitunderground.com/commerce-preview": 404, "https://keepitunderground.com/commerce-preview/shop": 404, "https://keepitunderground.com/": 200 },
  localGateChecks: "next start without VERCEL_ENV: all /commerce-preview/* = 404 (src/proxy.ts); with VERCEL_ENV=preview = 200",
  tests: {
    typecheck: "PASS",
    build: "PASS (next build, Next 16.2.1)",
    lintNewCode: "PASS (eslint on all new/changed commerce files)",
    lintFullRepo: "FAIL — 12 errors / 4 warnings, all pre-existing in public components (char-reveal, cursor-engine, navbar, cart-context, jsx comment text nodes); `next lint` was removed in Next 16 and is replaced by `eslint .`",
    unitGuards: "PASS 22/22 (npm run test:commerce-preview)",
    hostedPrototypeQA: "PASS 124/124 at 1440/768/390/320 + reduced motion",
    hostedReactQA: "PASS 162/162 at 1440/768/390/320 + reduced motion",
    issuesFoundAndFixedDuringQA: [
      "globals.css unlayered `* { margin:0; padding:0 }` overrides all Tailwind 4 margin/padding utilities site-wide (commerce now uses commerce.module.css; public reset unchanged)",
      "page-level notFound() streamed HTTP 200 because of root loading.tsx (fixed with src/proxy.ts hard 404)",
      "320 px cart: price covered the Remove button (fixed)",
    ],
  },
  fonts: {
    prototype: "Bebas Neue 400 + Space Mono 400/700 loaded from Google Fonts on the hosted Preview; page font-status = loaded",
    react: "Bebas Neue 400 + Space Mono 400 in use via next/font (self-hosted); Space Mono 700 face loads on demand",
    previousBlocked: "The 3 earlier BLOCKED font checks (offline fallback) are now PASS on the hosted Preview",
  },
  products: {
    readMethod: "Fourthwall admin products list (read-only, owner browser session)",
    "74c2ace1-4f7c-469b-a607-5555432019b4": { name: "KEEP IT UNDERGROUND Signal 01 Desk Mat", status: "Private", sold: 0 },
    "97704a85-a6b6-4090-894f-a7b5bc71a374": { name: "KEEP IT UNDERGROUND SUBSURFACE / 02", status: "Private", sold: 0 },
    shopFront: "keepitunderground-shop.fourthwall.com shows 'Coming soon'",
  },
  fourthwallTheme: {
    result: "BLOCKED",
    observed: { themes: ["Clean Frame (Active / Live, last modified Sep 30)"], drafts: 0, colors: { primary: "#000000", background: "#FFFFFF", text: "#000000", textOverPrimary: "#FFFFFF" } },
    reason: "Only the live theme exists; the editor's Save writes to it. Fourthwall help: adding a theme applies it and style settings apply to the active theme. No isolated unpublished draft was demonstrated, so nothing was saved.",
    saved: false, published: false,
    desired: { primary: "#8ACE00", background: "#050505", text: "#E8E4DC", textOverPrimary: "#050505", heading: "Bebas Neue 400", body: "Space Mono 400/700", buttons: "Square", checkoutSkin: "Dark mode" },
  },
  commerce: { realCartConnected: false, checkoutSessionCreated: false, orderCreated: false, paymentMade: false, legacyApiCheckoutUsed: false, plannedPriceUSD: 34, plannedPriceApplied: false },
  untouched: ["Fourthwall products, prices, print files, variants, Private status", "shop COMING_SOON status", "orders, payments, store credit, 80.49 USD sample authorization", "DNS", "Vercel Production, settings, env vars, protection", "main branch (no merge, no PR merge)", "public homepage content"],
  evidence: [ev + "prototype/", ev + "react/", ev + "live-baseline/", ev + "report-backups/"],
  credentialsSaved: false,
};
const recPath = dir + "execution-record.json";
const rec = JSON.parse(readFileSync(recPath, "utf8"));
rec.commerceDesignPreviewChecks = [...(rec.commerceDesignPreviewChecks ?? []), entry];
writeFileSync(recPath, JSON.stringify(rec, null, 2) + "\n");

const md = `

## Commerce design preview check — 2026-10-01T23:00Z (2026-10-02 Tallinn)

- Scope: protected design Preview of the two-desk-mat store. Not a sale, checkout, order or payment.
- Repository \`LEISSON-DARKSSON/kpt-underground\`, base \`99d2241\` (main, verified fresh), branch \`feat/commerce-design-parity-20261002\`, head \`e7c7f69009ccb7c0978e06410cd647b31ec90b39\`. Work done in a separate git worktree; the owner's checkout and untracked files were not modified.
- Vercel \`leisson-creative\` / \`kpt-underground\`: deployment \`dpl_BYQ3sbxRCWo17TBMqJwT6Xn2GANd\`, target **preview**, READY, same SHA. URL \`https://kpt-underground-5iqbh90k6-leisson-creative.vercel.app\` — unauthenticated request returns 302 to Vercel SSO (protection intact).
- Routes: \`/commerce-preview\` (bundled HTML prototype, strict CSP) and \`/commerce-preview/shop\`, \`/shop/signal-01\`, \`/shop/subsurface-02\`, \`/shop/handoff\` (React port in the existing app). \`src/proxy.ts\` returns 404 outside Vercel Preview / \`next dev\`.
- Production: \`keepitunderground.com/commerce-preview\` and \`/commerce-preview/shop\` = **404**; homepage 200 and unchanged.

| Check | Result |
|---|---|
| typecheck / next build | PASS / PASS |
| eslint, new commerce code | PASS |
| eslint, whole repo | **FAIL** — 12 pre-existing errors in public components (not changed here). \`next lint\` no longer exists in Next 16; script now \`eslint .\` |
| Guard tests \`npm run test:commerce-preview\` | PASS 22/22 |
| Hosted prototype QA (1440/768/390/320, reduced motion) | PASS 124/124 |
| Hosted React QA (same widths, cart, Tab/Escape/focus, handoff, no requests) | PASS 162/162 |
| Source fonts (Bebas Neue, Space Mono 400/700) | PASS — earlier offline BLOCKED font checks now verified on the hosted Preview |
| Fourthwall theme draft | **BLOCKED** — only live theme \"Clean Frame\" (colors #000/#FFF), no isolated draft; nothing saved |

Defects found by QA and fixed on the branch: Tailwind margin/padding utilities are dead site-wide because of the unlayered reset in \`globals.css\` (commerce uses a scoped CSS module; public reset unchanged); page-level \`notFound()\` streamed HTTP 200 because of root \`loading.tsx\` (hard 404 in proxy); 320 px cart price covered Remove.

Products read in Fourthwall admin (read-only): SIGNAL \`74c2ace1…\` **Private**, SUBSURFACE \`97704a85…\` **Private**, 0 sold; shop front shows \"Coming soon\". 34 USD remains a planned price, not applied.

No Fourthwall products, prices, print files, visibility, theme, shop status, orders, payments, credit, DNS, Production settings or \`main\` were changed. No checkout session was created. No credentials were saved. Evidence: \`${ev}\` (screenshots, \`hosted-qa.json\`, \`react-qa.json\`, \`live-baseline.json\`, report backups). All earlier report entries remain unchanged.
`;
appendFileSync(dir + "execution-report.md", md);
console.log("appended; checks now:", rec.commerceDesignPreviewChecks.length, "keys:", Object.keys(rec).join(","));
