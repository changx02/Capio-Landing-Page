# Capio web checkout — setup

Stripe-first subscription checkout for capioplan.com, built as **Cloudflare Pages Functions**
(the `functions/` directory deploys automatically with the static site — same domain, no extra
routing). The static `index.html` and the existing `capio-referral` waitlist Worker are untouched.

## Routes added

| Route                  | File                              | Purpose |
|------------------------|-----------------------------------|---------|
| `/subscribe`           | `functions/subscribe.js`          | The app's paywall opens `?plan=&billing=`; creates a Stripe Checkout Session and redirects. Invalid params show a plan picker. |
| `/subscribe/success`   | `functions/subscribe/success.js`  | Confirms payment; hands the entitlement back to the app via a signed `capio://redeem?token=` deep link. |
| `/subscribe/cancel`    | `functions/subscribe/cancel.js`   | Friendly "no charge" page. |
| `/terms`, `/privacy`   | `terms.html`, `privacy.html`      | Static legal pages the iOS paywall links to. |

The app builds the subscribe URL as `https://capioplan.com/subscribe?plan=capio&billing=<annual|monthly>`
(legacy `plan=pro` / `pro-plus` links are folded into `capio`).

## Stripe product to create

One "Capio" Product with two recurring Prices (subscription mode):

| Plan | Billing | Price | Map to env var |
|------|---------|-------|----------------|
| Capio | annual  | $119.99/yr | `STRIPE_PRICE_CAPIO_ANNUAL` |
| Capio | monthly | $14.99/mo  | `STRIPE_PRICE_CAPIO_MONTHLY` |

## Environment variables (Cloudflare Pages → Settings → Environment variables)

Set as **production** (and preview, if you test there). Secrets should be marked encrypted.

```
STRIPE_SECRET_KEY            = sk_live_… (or sk_test_… while testing)   [secret]
STRIPE_PRICE_CAPIO_ANNUAL    = price_…
STRIPE_PRICE_CAPIO_MONTHLY   = price_…
CAPIO_SIGNING_KEY            = base64 of the 32-byte Ed25519 PRIVATE seed [secret]
```

Until `STRIPE_SECRET_KEY` + the price IDs are set, `/subscribe` returns a graceful
"checkout coming soon" page (503) instead of erroring — safe to deploy pre-launch.

`CAPIO_SIGNING_KEY` is the private pair of the public key embedded in the iOS app
(`Capio/Services/LifetimeCode.swift`) and the redeem worker. Generate it with the iOS repo's
`tools/generate-lifetime-code.swift keygen`. Without it, `/subscribe/success` shows a generic
success page (no deep-link token).

## App handback — the signed deep-link token (needs a paired iOS change)

On a paid checkout, `/subscribe/success` mints a signed token and opens `capio://redeem?token=…`
(with a copyable code fallback). The token is a **version-2 "subscription"** token, deliberately
distinct from the **version-1 "lifetime"** redeem codes:

```
base64url( [version:1=0x02][tier:1][expiry:4 BE unix-seconds][serial:8] ‖ ed25519_sig:64 )
tier byte: 1 = pro, 2 = proPlus
```

**The shipping app does not accept v2 yet** — its verifier only handles v1 (lifetime), so it will
reject these tokens. That is intentional: it prevents a web subscription from accidentally granting
*lifetime* access. Before turning this on, the iOS side must be updated to:

1. Parse version 2 in `LifetimeCode.verify` (read tier + expiry).
2. Grant an **expiring** subscription entitlement (honor the `expiry`), not a lifetime grant.
3. Decide renewal handling — re-issue a fresh token on each Stripe renewal (simplest), or add a
   lightweight entitlement-check endpoint later.

Coordinate the exact format with the iOS repo before flipping `CAPIO_SIGNING_KEY` on.

## Recommended next: webhook (not built here)

Add `functions/api/stripe/webhook.js` to verify the `Stripe-Signature` header and handle
`customer.subscription.updated/deleted` + `invoice.paid` so renewals/cancellations are reflected
(e.g. re-mint tokens, or revoke). Left out of this scaffolding pending the renewal-handling decision
above.

## Deploy

Push to `main` — Cloudflare Pages auto-builds and picks up `functions/`. Then set the env vars and
create the Stripe products/prices. Test with `sk_test_…` keys and Stripe's test cards first.
