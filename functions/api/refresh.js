// POST /api/refresh   { "serial": "<16-hex>" }
//
// The Capio app calls this near/after its subscription token's expiry. We look up
// the Stripe subscription recorded for that serial and, if it's still active,
// mint a FRESH v2 token (same serial, new expiry). No accounts — the serial is a
// bearer identifier. Returns { ok:true, token } or { ok:false, reason }.
//
// env: STRIPE_SECRET_KEY, CAPIO_SIGNING_KEY, SUBS (KV namespace).

import { mintSubscriptionToken } from "../_token.js";

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let serial;
  try {
    serial = (await request.json()).serial;
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (typeof serial !== "string" || !/^[0-9a-f]{16}$/.test(serial)) {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (!env.SUBS || !env.STRIPE_SECRET_KEY || !env.CAPIO_SIGNING_KEY) {
    return json({ ok: false, reason: "not_configured" }, 503);
  }

  const subId = await env.SUBS.get(`serial:${serial}`);
  if (!subId) return json({ ok: false, reason: "unknown" });

  const r = await fetch(`https://api.stripe.com/v1/subscriptions/${subId}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
  });
  const sub = await r.json().catch(() => ({}));
  if (!r.ok) return json({ ok: false, reason: "stripe_error" }, 502);

  const active = sub.status === "active" || sub.status === "trialing";
  if (!active) return json({ ok: false, reason: "inactive", status: sub.status });

  const expiry = sub.current_period_end || Math.floor(Date.now() / 1000) + 32 * 86400;
  let token;
  try {
    ({ token } = await mintSubscriptionToken(env.CAPIO_SIGNING_KEY, "capio", expiry, serial));
  } catch {
    return json({ ok: false, reason: "mint_error" }, 500);
  }

  return json({ ok: true, token });
}
