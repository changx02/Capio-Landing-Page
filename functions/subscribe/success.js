// GET /subscribe/success?session_id=cs_…
//
// Stripe redirects here after a completed subscription checkout. We confirm the
// session is paid, then hand the entitlement back to the Capio app as a SIGNED
// deep-link token: capio://redeem?token=<token>.
//
// Token format is the v2 "subscription" token (see functions/_token.js). The app
// grants access until the embedded expiry. We also record serial→subscription in
// KV so /api/refresh can re-issue a fresh token on renewal.
//
// Required env to mint tokens:
//   STRIPE_SECRET_KEY     (to verify the session)
//   CAPIO_SIGNING_KEY     base64 of the 32-byte Ed25519 PRIVATE seed (secret)
//   SUBS                  KV namespace binding (optional; enables renewal)

import { page, htmlResponse } from "../_brand.js";
import { mintSubscriptionToken } from "../_token.js";

function genericSuccess(origin) {
  return htmlResponse(page("You're in", `<h1>You're subscribed 🎉</h1>
    <p>Open Capio on your device — your plan is ready.</p>
    <a class="btn" href="capio://">Open Capio</a>
    <p class="muted">Manage your subscription anytime at
      <a href="${origin}/">capioplan.com</a>.</p>`));
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  const sessionId = url.searchParams.get("session_id");

  // No Stripe configured or no session → friendly generic success.
  if (!sessionId || !env.STRIPE_SECRET_KEY) return genericSuccess(origin);

  // Confirm the session is paid and read the plan + subscription period end.
  const r = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${sessionId}?expand[]=subscription`,
    { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } }
  );
  const session = await r.json().catch(() => ({}));
  const paid = session.payment_status === "paid" || session.status === "complete";
  if (!r.ok || !paid) return genericSuccess(origin);

  const plan = session.metadata?.plan || "capio";
  // Default to 32 days out if the period end isn't available yet.
  const expiry = session.subscription?.current_period_end
    || Math.floor(Date.now() / 1000) + 32 * 86400;

  // Mint the deep-link token only when the signing key is configured.
  if (!env.CAPIO_SIGNING_KEY) return genericSuccess(origin);

  let token, serial;
  try {
    ({ token, serial } = await mintSubscriptionToken(env.CAPIO_SIGNING_KEY, plan, expiry));
  } catch {
    return genericSuccess(origin);
  }

  // Record serial → Stripe subscription so /api/refresh can renew later.
  // Best-effort: skip silently if the SUBS KV namespace isn't bound yet.
  const subscriptionId = session.subscription?.id || session.subscription;
  if (env.SUBS && subscriptionId) {
    try { await env.SUBS.put(`serial:${serial}`, String(subscriptionId)); } catch {}
  }

  const link = `capio://redeem?token=${token}`;
  return htmlResponse(page("You're in", `<h1>You're subscribed 🎉</h1>
    <p>Tap below to unlock Capio on this device.</p>
    <a class="btn" href="${link}">Open Capio</a>
    <p class="muted">Button didn't work? Paste this code in Capio →
      Settings → Account → Redeem:</p>
    <div class="mono">${token}</div>
    <p class="muted">Manage your subscription anytime at
      <a href="${origin}/">capioplan.com</a>.</p>`));
}
