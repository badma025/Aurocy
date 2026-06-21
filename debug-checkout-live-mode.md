# Debug Session: checkout-live-mode
- **Status**: [OPEN]
- **Issue**: Stripe Checkout opens in live mode when attempting to buy a product, even though `.env.local` contains test keys.
- **Debug Server**: Pending
- **Log File**: .dbg/trae-debug-log-checkout-live-mode.ndjson

## Reproduction Steps
1. Start the Next.js app locally.
2. Open a deck sales page.
3. Click `Buy Now`.
4. Enter Stripe test card `4242 4242 4242 4242`.
5. Observe Stripe reporting that the request is in live mode.

## Hypotheses & Verification
| ID | Hypothesis | Likelihood | Effort | Evidence |
|----|------------|------------|--------|----------|
| A | The server route is still reading a live secret key from the actual process environment instead of the `.env.local` value shown in the editor. | High | Low | Pending |
| B | The checkout session is created with a live Stripe account because the dev server process was started before the test keys were loaded or after another environment source overrode them. | High | Low | Pending |
| C | The browser is being redirected to an older live Checkout URL that is cached or coming from a stale client bundle. | Medium | Low | Pending |
| D | A different local server/process is handling `/api/checkout`, so the request is not reaching the code we inspected. | Medium | Medium | Pending |
| E | The Stripe account/dashboard mode and the API keys belong to different environments/accounts, causing a mismatch that appears as live-mode checkout. | Medium | Medium | Pending |

## Log Evidence
- `.env.local` currently contains test-mode keys.
- `.next/dev/logs/next-development.log` shows the running browser bundle received `pk_live_51...`.
- `.next/dev/logs/next-development.log` shows the running checkout route used `sk_live_51...`.
- Direct POST to `http://localhost:3000/api/checkout` returned a Stripe Checkout URL containing `cs_live_...`.
- `next dev --port 3002` reported another Next dev server was already running for the same app on port `3000`, confirming a stale server/process.

## Verification Conclusion
- **Hypothesis A**: Confirmed. The active server process is using live-mode Stripe keys.
- **Hypothesis B**: Confirmed. An already-running Next.js dev process is serving stale/live env values.
- **Hypothesis C**: Rejected. The returned Checkout URL itself is live (`cs_live_...`), so this is not just browser caching.
- **Hypothesis D**: Partially confirmed. A different already-running local Next process handled the requests during debugging.
- **Hypothesis E**: Not needed to explain the current symptom.
