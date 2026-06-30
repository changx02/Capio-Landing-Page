// GET /subscribe?plan=<pro|pro-plus>&billing=<annual|monthly>
//
// The Capio iOS paywall opens this URL as the primary (Stripe) checkout path.
// We create a Stripe Checkout Session (subscription mode) for the matching
// price and 303-redirect the browser to Stripe's hosted checkout.
//
// Required env (Cloudflare Pages project → Settings → Environment variables):
//   STRIPE_SECRET_KEY            sk_live_… / sk_test_…   (secret)
//   STRIPE_PRICE_PRO_ANNUAL      price_…
//   STRIPE_PRICE_PRO_MONTHLY     price_…
//   STRIPE_PRICE_PROPLUS_ANNUAL  price_…
//   STRIPE_PRICE_PROPLUS_MONTHLY price_…
// See STRIPE_SETUP.md.

import { page, htmlResponse, PRICE_ENV, PLAN_LABEL } from "./_brand.js";

function picker(origin) {
  const rows = Object.keys(PLAN_LABEL).map((k) => {
    const [plan, billing] = k.split("|");
    const [name, price] = PLAN_LABEL[k];
    return `<a class="plan" href="${origin}/subscribe?plan=${plan}&billing=${billing}">
      <b>${name}</b><span>${price}</span></a>`;
  }).join("");
  return page("Choose a plan", `<h1>Choose your plan</h1>
    <p>Pick a plan to continue to secure checkout.</p>
    <div class="plans">${rows}</div>`);
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const origin = url.origin;
  let plan = (url.searchParams.get("plan") || "").toLowerCase();
  // Single plan now — fold any legacy tier names into "capio".
  if (plan === "pro" || plan === "pro-plus") plan = "capio";
  const billing = (url.searchParams.get("billing") || "").toLowerCase();
  const key = `${plan}|${billing}`;

  // Invalid/missing params → show a branded picker rather than erroring.
  if (!PRICE_ENV[key]) {
    return htmlResponse(picker(origin));
  }

  // Graceful degradation if Stripe isn't configured yet (e.g. pre-launch).
  const priceId = env[PRICE_ENV[key]];
  if (!env.STRIPE_SECRET_KEY || !priceId) {
    return htmlResponse(
      page("Checkout coming soon", `<h1>Checkout isn't live yet</h1>
        <p>Subscriptions open soon. Join the waitlist at
        <a href="${origin}/">capioplan.com</a>.</p>`),
      503
    );
  }

  // Create a subscription Checkout Session via the Stripe REST API.
  const body = new URLSearchParams();
  body.set("mode", "subscription");
  body.set("line_items[0][price]", priceId);
  body.set("line_items[0][quantity]", "1");
  body.set("allow_promotion_codes", "true");
  body.set("success_url", `${origin}/subscribe/success?session_id={CHECKOUT_SESSION_ID}`);
  body.set("cancel_url", `${origin}/subscribe/cancel`);
  // Carry the plan through so success/webhook know what was bought.
  body.set("client_reference_id", key);
  body.set("metadata[plan]", plan);
  body.set("metadata[billing]", billing);
  body.set("subscription_data[metadata][plan]", plan);
  body.set("subscription_data[metadata][billing]", billing);

  const resp = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });
  const session = await resp.json();

  if (resp.ok && session.url) {
    return Response.redirect(session.url, 303);
  }

  return htmlResponse(
    page("Something went wrong", `<h1>Couldn't start checkout</h1>
      <p>Please try again, or contact <a href="mailto:vee@capioplan.com">vee@capioplan.com</a>.</p>
      <a class="btn" href="${origin}/subscribe?plan=${plan}&billing=${billing}">Retry</a>`),
    502
  );
}
