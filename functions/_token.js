// Shared Ed25519 v2 "subscription" token minting for Cloudflare Pages Functions.
// Used by /subscribe/success (first issue) and /api/refresh (renewal re-issue).
//
// Token: base64url( [0x02][tier:1][expiry:4 BE unix-seconds][serial:8] ‖ ed25519_sig:64 )
// tier byte: 2 = the single paid "Capio" plan (the iOS verifier maps any valid byte to it).

const TIER_BYTE = { capio: 2, pro: 2, "pro-plus": 2 };

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

export function randomSerialHex() {
  const b = new Uint8Array(8);
  crypto.getRandomValues(b);
  return [...b].map((x) => x.toString(16).padStart(2, "0")).join("");
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

/// Mint a v2 subscription token. Reuses `serialHex` when given (renewal keeps the
/// same serial so the serial→subscription mapping stays valid); generates a fresh
/// one otherwise. Returns { token, serial }.
export async function mintSubscriptionToken(seedB64, plan, expiryUnix, serialHex) {
  const tier = TIER_BYTE[plan] ?? 2;
  const serial = serialHex || randomSerialHex();
  const payload = new Uint8Array(14);
  payload[0] = 0x02;
  payload[1] = tier;
  payload[2] = (expiryUnix >>> 24) & 0xff;
  payload[3] = (expiryUnix >>> 16) & 0xff;
  payload[4] = (expiryUnix >>> 8) & 0xff;
  payload[5] = expiryUnix & 0xff;
  payload.set(hexToBytes(serial), 6);
  const sig = await signEd25519(b64ToBytes(seedB64), payload);
  return { token: bytesToB64url(new Uint8Array([...payload, ...sig])), serial };
}
