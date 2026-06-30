// GET /subscribe/success?session_id=cs_…
//
// Stripe redirects here after a completed subscription checkout. We confirm the
// session is paid, then hand the entitlement back to the Capio app as a SIGNED
// deep-link token: capio://redeem?token=<token>.
//
// Token format — SUBSCRIPTION (version 2), distinct from the lifetime codes
// (version 1) so the two never collide:
//   base64url( [version:1=0x02][tier:1][expiry:4 BE unix-seconds][serial:8] ‖ ed25519_sig:64 )
//   tier byte: 1 = pro, 2 = proPlus
//
// IMPORTANT (iOS coordination): the shipping Capio app's verifier only accepts
// version 1 (lifetime) today, so it will REJECT these v2 tokens until the iOS
// side is updated to parse v2 and grant an EXPIRING subscription (using the
// embedded expiry). That is intentional — it prevents a web purchase from
// accidentally granting lifetime. Do not enable this in the app until the
// paired iOS change lands. See STRIPE_SETUP.md.
//
// Required env to mint tokens:
//   STRIPE_SECRET_KEY     (to verify the session)
//   CAPIO_SIGNING_KEY     base64 of the 32-byte Ed25519 PRIVATE seed (secret),
//                         the pair of the public key embedded in the app/worker.

import { page, htmlResponse } from "../_brand.js";

const TIER_BYTE = { pro: 1, "pro-plus": 2 };

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out;
}
function b64ToBytes(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function bytesToB64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function signEd25519(seed, message) {
  // Wrap the raw 32-byte seed as PKCS8 DER for WebCrypto Ed25519 import.
  const pkcs8 = new Uint8Array([...hexToBytes("302e020100300506032b657004220420"), ...seed]);
  const algos = [{ name: "Ed25519" }, { name: "NODE-ED25519", namedCurve: "NODE-ED25519" }];
  for (const algo of algos) {
    try {
      const key = await crypto.subtle.importKey("pkcs8", pkcs8, algo, false, ["sign"]);
      const sig = await crypto.subtle.sign({ name: algo.name }, key, message);
      return new Uint8Array(sig);
    } catch {
      /* try next naming */
    }
  }
  throw new Error("Ed25519 signing unavailable");
}

async function mintToken(seedB64, plan, expiryUnix) {
  const tier = TIER_BYTE[plan] ?? 2;
  const payload = new Uint8Array(14);
  payload[0] = 0x02; // version 2 = subscription
  payload[1] = tier;
  // expiry: 4-byte big-endian unix seconds
  payload[2] = (expiryUnix >>> 24) & 0xff;
  payload[3] = (expiryUnix >>> 16) & 0xff;
  payload[4] = (expiryUnix >>> 8) & 0xff;
  payload[5] = expiryUnix & 0xff;
  crypto.getRandomValues(payload.subarray(6, 14)); // 8-byte serial
  const sig = await signEd25519(b64ToBytes(seedB64), payload);
  return bytesToB64url(new Uint8Array([...payload, ...sig]));
}

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

  const plan = session.metadata?.plan || "pro-plus";
  // Default to 32 days out if the period end isn't available yet.
  const expiry = session.subscription?.current_period_end
    || Math.floor(Date.now() / 1000) + 32 * 86400;

  // Mint the deep-link token only when the signing key is configured.
  if (!env.CAPIO_SIGNING_KEY) return genericSuccess(origin);

  let token;
  try {
    token = await mintToken(env.CAPIO_SIGNING_KEY, plan, expiry);
  } catch {
    return genericSuccess(origin);
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
