# Fourthwall Storefront connection — read-only stage

Prepared 2026-09-23. **Not a completed live integration.**

This change adds a small typed GET-only client and an opt-in diagnostic route at
`/api/fourthwall/status`. It does not change the existing product catalog, cart,
Stripe checkout, fulfillment or product visibility. No new dependencies.

## Configuration

Merge variables from `docs/fourthwall.env.example` into the existing local/Vercel
configuration. Do not overwrite other variables. The actual user-supplied public
Storefront token is NOT committed. Do not substitute Platform API credentials.

1. Add `FOURTHWALL_STOREFRONT_TOKEN` to the correct project's Preview environment.
2. Set `FOURTHWALL_READONLY_ENABLED=true` to enable the diagnostic.
3. Visit `/api/fourthwall/status` on the new deployment.
4. Confirm the returned shop name/domain and pin the real id with
   `FOURTHWALL_EXPECTED_SHOP_ID`. Redeploy after changing Vercel environment values.
5. An empty public catalog can be a valid response. It does not prove that private
   drafts are absent. `salesReady` deliberately remains false even on success.

Do not replace checkout until real products/variants, pricing, shipping, payment
and fulfillment have been verified. Storefront access does not authorize product
creation or artwork uploads; those require Platform API or an authorized admin UI.

## Local checks

Requires Node 22.16+ with TypeScript type-stripping enabled. Set
`FOURTHWALL_TEST_TOKEN` in the test environment to a dummy Storefront-format
fixture. Tests mock every request; no live credential is needed or committed:

```sh
node --experimental-strip-types --test tests/fourthwall/storefront.test.mjs
npx tsc --noEmit
npm run build
```

The 14 isolated client tests were run in the working container. A full application
build was NOT run. Direct live API checks in the working container stopped at DNS
resolution; the web retrieval tool also could not access the API. No live shop id,
product count or authentication success is claimed. The Vercel project read
returned a connector schema error, so hosted environment values were not saved.

The endpoint has no analytics and does not expose the token or upstream error
bodies. It reads public Storefront data only. Disable it after diagnostics if it
is no longer needed. `all` products are paginated with a safety cap; exceeding it
returns an error rather than silently returning an incomplete catalog.

## Official references (reviewed 2026-09-23)

- https://docs.fourthwall.com/storefront/getting-started
- https://docs.fourthwall.com/api-reference/storefront/shop/get-shop
- https://docs.fourthwall.com/storefront/products
- https://docs.fourthwall.com/storefront/overview
