# Commerce preview — hosted browser QA

Repeatable checks for every feature-branch Vercel Preview of `/commerce-preview`.
They run against the real hosted deployment (Deployment Protection stays on) with
real web fonts, in the locally installed Chrome. Nothing is purchased, no checkout
session or order is created; the scripts only read pages and click the demo UI.

```sh
# one-off, not saved to package.json (avoids a browser download):
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --no-save playwright-core@1

# 1) get a temporary share link for the Preview (Vercel MCP get_access_to_vercel_url,
#    or Vercel dashboard → Share). Never commit the link.
node scripts/commerce-preview/qa/prototype-hosted.mjs "<share-url to /commerce-preview>" ./qa-out/prototype
node scripts/commerce-preview/qa/react-hosted.mjs     "<share-url to /commerce-preview/shop>" ./qa-out/react
node scripts/commerce-preview/qa/live-baseline.mjs    ./qa-out/live-baseline   # read-only public site capture
```

Coverage: 1440 / 768 / 390 / 320 px, source fonts actually loaded (Bebas Neue,
Space Mono 400/700), ink/green tokens, catalog grid, both detail pages bound to the
right offer ID and artwork, image proportions, cart add/qty/remove/empty,
Tab focus containment, visible focus ring, Escape + focus return, checkout handoff
disabled, no inputs/forms, no checkout/third-party requests, no audio `play()`,
reduced motion. Output: screenshots + `hosted-qa.json` / `react-qa.json`.

Production must keep returning 404 for `/commerce-preview/*` (src/proxy.ts);
`npm run test:commerce-preview` covers that statically.
