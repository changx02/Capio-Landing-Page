// POST /api/trial   { "identityToken": "<Apple JWT>" }
//
// One 14-day trial per Apple ID. The app sends the Sign in with Apple identity
// token; we verify it against Apple's public keys, then get-or-create a trial
// start date keyed by SHA-256(appleUserId). Reinstalling / clearing iCloud /
// switching devices can't reset it — the same Apple ID always gets the same
// start. We store ONLY hash → date; email/name from the token are discarded.
//
// env: TRIALS (KV namespace). No secrets — Apple's JWKS is public.

const TRIAL_DAYS = 14;
const APPLE_ISS = "https://appleid.apple.com";
const APPLE_JWKS = "https://appleid.apple.com/auth/keys";
const ALLOWED_AUD = ["com.capioplan.capio", "com.capioplan.capio.dev"];

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function b64urlToBytes(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
function b64urlToString(s) {
  return new TextDecoder().decode(b64urlToBytes(s));
}
async function sha256hex(s) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Verify an Apple identity token; return its claims or null.
async function verifyAppleToken(token) {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [headerB64, payloadB64, sigB64] = parts;

  let header, claims;
  try {
    header = JSON.parse(b64urlToString(headerB64));
    claims = JSON.parse(b64urlToString(payloadB64));
  } catch {
    return null;
  }
  if (header.alg !== "RS256" || !header.kid) return null;

  // Find the matching Apple public key.
  const jwks = await fetch(APPLE_JWKS).then((r) => r.json()).catch(() => null);
  const jwk = jwks?.keys?.find((k) => k.kid === header.kid);
  if (!jwk) return null;

  const key = await crypto.subtle.importKey(
    "jwk",
    { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"]
  );
  const signingInput = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    b64urlToBytes(sigB64),
    signingInput
  );
  if (!valid) return null;

  // Claim checks.
  const now = Math.floor(Date.now() / 1000);
  if (claims.iss !== APPLE_ISS) return null;
  const auds = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!auds.some((a) => ALLOWED_AUD.includes(a))) return null;
  if (typeof claims.exp !== "number" || claims.exp < now) return null;
  if (!claims.sub) return null;

  return claims;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  let identityToken;
  try {
    identityToken = (await request.json()).identityToken;
  } catch {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (typeof identityToken !== "string" || !identityToken) {
    return json({ ok: false, reason: "invalid" }, 400);
  }
  if (!env.TRIALS) {
    return json({ ok: false, reason: "not_configured" }, 503);
  }

  const claims = await verifyAppleToken(identityToken);
  if (!claims) return json({ ok: false, reason: "invalid_token" }, 401);

  // Ledger: hash the Apple user id; store only hash → start date.
  const key = `trial:${await sha256hex(claims.sub)}`;
  let trialStart = parseInt((await env.TRIALS.get(key)) || "", 10);
  if (!trialStart) {
    trialStart = Math.floor(Date.now() / 1000);
    await env.TRIALS.put(key, String(trialStart));
  }

  return json({ ok: true, trialStart, trialDays: TRIAL_DAYS });
}
