# Cross-domain verification procedure (ticket H05)

Status: PROCEDURE ONLY, written 2026-10-02. Every step below is NOT_RUN. Nothing here was executed, no collector exists, no Measurement ID exists in this repository, no account was touched. DNS and the checkout host stay as they are: `keepitunderground.com` (Next.js) and `keepitunderground-shop.fourthwall.com` (Fourthwall hosted checkout).

Companion files: `docs/measurement-plan.md` (plan), `docs/measurement-contract.json` (machine-readable contract), `src/lib/analytics-collector.ts` (disabled GA4 one-stream, Basic-consent plan).

## 1. What is NOT assumed

- A shared Measurement ID, a shared parent domain or a subdomain relationship proves nothing about cross-domain continuity. Only the observations in section 5 can.
- "Linker configured" is not "linker working". A configuration list is never evidence.
- A non-empty `dataLayer` is a local buffer, not a collector receipt.
- Fourthwall's tag, consent handling and redirects are not under our control and are not documented to cover external sites (see `docs/measurement-plan.md` section 5).

## 2. Working hypotheses (all UNVERIFIED)

| Id | Hypothesis | Why it may be false |
|---|---|---|
| HY1 | Adding the checkout host to the GA4 cross-domain list makes the linker add `_gl` to the checkout navigation. | Google documents decoration for links and form submits. `cart.tsx` navigates with `window.location.assign(url)`, which is neither. UNVERIFIED. |
| HY2 | The destination (Fourthwall) tag accepts an incoming `_gl` and continues the same client id and session. | Requires Fourthwall's tag to be a GA4 tag with the same stream and linker acceptance enabled. Not stated in Fourthwall's pages. UNVERIFIED. |
| HY3 | Redirects on the checkout host keep the `_gl` query parameter. | A redirect that rebuilds the URL can drop unknown parameters. UNVERIFIED. |
| HY4 | A consent decision made on our site is honored or at least not contradicted on the checkout host. | Consent is stored per origin; Fourthwall has its own banner and rules. UNVERIFIED. |
| HY5 | Fourthwall's native events (page view, add to cart, purchase) land in the same stream and do not double our own events. | Depends on the Measurement ID entered in Fourthwall Tracking Pixels. UNVERIFIED. |

## 3. Owner-gated prerequisites (none is met today)

1. The owner approves one collector (recommended: the single GA4 setup) and names the property and web stream, reusing an existing one if it exists.
2. A test property or stream (or DebugView on a throwaway stream) is available so real reporting data is not polluted.
3. The owner decides the consent policy and banner, and approves activation of `collectorPlan` (a separate PR; `ownerActivation` stays false until then).
4. The owner enters the same Measurement ID in Fourthwall (Analytics, Tracking Pixels) or explicitly decides not to.
5. Owner-controlled browser profile, clean (no extensions, no earlier `_ga` cookies), plus one mobile device.
6. Hard limits: no order, no payment, no sample, no shop credit. Stop at the hosted checkout page (HTTP 200).

## 4. Evidence rules (what may be stored)

- Record booleans, counts and short enums only. PASS criteria below are booleans.
- Never store or paste: a client id, a `_ga` or `_ga_*` cookie value, a `_gl` value, a session id, a checkout URL, a cart id, an email, or a screenshot that shows any of them. Compare identifiers by eye in the debug view and write only `same` / `different` as a boolean.
- Do not commit or log the Storefront token. QA scripts get it through `with-token.ps1`, not through this procedure.
- Hygiene scan before filing a result (step XD09): none of the patterns below may appear in `docs/`, `evidence/` or the result record: `_gl=`, `GA1.`, `cartId=`, `fourthwall.com/checkout`, `ptkn_`, `@`-addresses of customers.

## 5. Steps

Every row: status NOT_RUN. Fill `pass` only after running the step; until then it stays `null`.

| Step | Action | Observe | Boolean fields (PASS when all true) |
|---|---|---|---|
| XD01 | Open the site in the clean profile, consent unset. Open the browser network panel and application storage. | No request to a Google collection endpoint, no collector script, no `_ga*` cookie on the site. Add to cart and open checkout still work. | `site_no_collector_before_consent`, `site_no_ga_cookie_before_consent`, `shopping_works_without_consent` |
| XD02 | Refuse consent, repeat XD01 including the checkout navigation. | Same as XD01. On the checkout host record what Fourthwall does (banner, scripts, cookies). | `site_no_collector_when_denied`, `shopping_works_when_denied`, `checkout_host_behaviour_recorded` |
| XD03 | Grant consent. Open `/?utm_source=xdtest&utm_medium=qa&utm_campaign=h05` (test values only). | The collector script is loaded only after the grant. Debug view shows `view_item_list`, then `view_item`, `add_to_cart`, `begin_checkout` with allowlisted params only. | `script_loaded_only_after_grant`, `events_arrive_in_debug_view`, `no_forbidden_param_in_payload`, `no_purchase_event_from_site` |
| XD04 | Press checkout and stop on the hosted checkout page. Inspect the address bar immediately on arrival (look, do not copy). | Whether a linker parameter is present when the page lands. | `linker_param_present_on_arrival` (report as unknown if the page redirected before it could be read) |
| XD05 | Redirect chain with a synthetic URL that carries a dummy linker value: `curl -sIL "https://keepitunderground-shop.fourthwall.com/?_gl=xdtest"` (headers only, no cookies, no order). | Number of hops and whether each Location header keeps the query. Do not paste the headers into any file. | `redirect_chain_recorded`, `redirects_preserve_linker_param` |
| XD06 | Compare identity on both hostnames in the debug view for one visit. | Same client id and same session on `keepitunderground.com` and `keepitunderground-shop.fourthwall.com`; source, medium, campaign from XD03 preserved; no new "direct" session. | `client_id_same_across_domains`, `session_same_across_domains`, `utm_preserved_on_checkout_host` |
| XD07 | Destination tag acceptance. | The checkout host creates its own `_ga*` cookie (existence only) and its events appear in the same stream; the checkout host is not listed as a self-referral. | `destination_tag_accepts_linker`, `destination_cookie_created`, `events_same_stream`, `no_self_referral` |
| XD08 | Consent on both domains. Grant on the site, land on checkout; then deny on the site, land on checkout. | Whether the checkout host's tag respects, ignores or contradicts our decision. If it ignores it, that is a policy gap for the owner, not a pass. | `checkout_consent_state_recorded`, `consent_not_contradicted_on_checkout_host` |
| XD09 | Edge cases: browser Back from checkout, reload on checkout, mobile in-app browser, ad blocker, consent changed mid-session. Then run the storage hygiene scan from section 4. | Each case keeps shopping working; attribution outcome recorded per case; scan finds no raw ids, cookies or checkout URLs. | `back_reload_ok`, `inapp_browser_ok`, `adblock_shopping_ok`, `consent_change_ok`, `hygiene_scan_clean` |
| XD10 | Double counting: compare our events with Fourthwall native events for one action. | No duplicate `view_item` or `add_to_cart` for the same action; `purchase` is not tested here (it needs a real order and comes only from Fourthwall). | `no_double_count_view_add`, `purchase_not_exercised` |

## 6. Result record (booleans only, all NOT_RUN today)

```json
{
  "procedure": "docs/cross-domain-check.md",
  "executedAt": null,
  "environment": null,
  "sha": null,
  "steps": {
    "XD01": { "status": "NOT_RUN", "pass": null },
    "XD02": { "status": "NOT_RUN", "pass": null },
    "XD03": { "status": "NOT_RUN", "pass": null },
    "XD04": { "status": "NOT_RUN", "pass": null },
    "XD05": { "status": "NOT_RUN", "pass": null },
    "XD06": { "status": "NOT_RUN", "pass": null },
    "XD07": { "status": "NOT_RUN", "pass": null },
    "XD08": { "status": "NOT_RUN", "pass": null },
    "XD09": { "status": "NOT_RUN", "pass": null },
    "XD10": { "status": "NOT_RUN", "pass": null }
  },
  "crossDomain": "NOT_RUN"
}
```

Verdict rules:

- `crossDomain` is PASS only when XD03, XD04, XD05, XD06, XD07 and XD08 are all true, evidenced by the debug view and not by configuration.
- Anything else is "attribution unknown" (not zero, not organic, not direct, not new customer) and every report says so.
- XD01, XD02 and XD09 can fail the whole activation on their own: refused consent that still sends data, or shopping that breaks, blocks activation regardless of attribution.

## 7. If it fails

- Record the failing booleans and report attribution as unknown.
- A fix is a separate, owner-approved `src/` change: decorate the checkout URL at the `window.location.assign` call using the collector's documented linker mechanism for the checkout host, copying only documented linker fields, never auth secrets or contact data. Re-run XD04 to XD08 afterwards.
- Do not change DNS, the checkout host or the Fourthwall checkout flow to make this pass.
