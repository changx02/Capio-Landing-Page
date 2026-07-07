// POST /api/redeem   { "token": "<lifetime code>" }
//
// Single-use LIFETIME codes (v1 tokens). Verifies the Ed25519 signature, then
// burns the code's serial in the REDEEMED KV so it can be used only once.
// Subscription tokens (v2) never reach here — they're verified on-device.
//
// env: REDEEMED (KV namespace). CAPIO_PUBLIC_KEY (optional; falls back to the
//      embedded key). Rotate both the app key and this key at launch — see the
//      iOS repo's tools/KEY_ROTATION.md.

// TEST public key — matches the app's LifetimeCode.swift. Set CAPIO_PUBLIC_KEY
// to override (and rotate for production).
const PUBLIC_KEY_DEFAULT = "9V8dA1XrPWbPzPKcgTjfSjg5pUM5JjmBixy42u0swXM=";
const V1_LEN = 10 + 64; // [0x01][tier:1][serial:8] ‖ sig:64

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
function b64urlToBytes(s) {
  s = s.trim().replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64ToBytes(s) {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function toHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
}
async function verifyEd25519(pubBytes, signature, payload) {
  const algos = [{ name: "Ed25519" }, { name: "NODE-ED25519", namedCurve: "NODE-ED25519" }];
  for (const algo of algos) {
    try {
      const key = await crypto.subtle.importKey("raw", pubBytes, algo, false, ["verify"]);
      return await crypto.subtle.verify({ name: algo.name }, key, signature, payload);
    } catch {
      /* try next naming */
    }
  }
  throw new Error("Ed25519 unavailable");
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let token;
  try {
    token = (await request.json()).token;
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (typeof token !== "string" || !token) return json({ ok: false, reason: "invalid" }, 400);
  if (!env.REDEEMED) return json({ ok: false, reason: "not_configured" }, 503);

  let bytes;
  try {
    bytes = b64urlToBytes(token);
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  // Only v1 lifetime codes are single-use-burned here.
  if (bytes.length !== V1_LEN || bytes[0] !== 0x01) {
    return json({ ok: false, reason: "invalid" }, 400);
  }

  const payload = bytes.slice(0, 10);
  const signature = bytes.slice(10);
  const valid = await verifyEd25519(b64ToBytes(env.CAPIO_PUBLIC_KEY || PUBLIC_KEY_DEFAULT), signature, payload);
  if (!valid) return json({ ok: false, reason: "invalid" }, 400);

  const serial = toHex(payload.slice(2, 10));
  if (await env.REDEEMED.get(serial)) {
    return json({ ok: false, reason: "already_redeemed" });
  }
  await env.REDEEMED.put(serial, new Date().toISOString());
  return json({ ok: true, tier: "capio" });
}
