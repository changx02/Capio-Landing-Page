// GET /subscribe/cancel — Stripe sends the user here if they back out.

import { page, htmlResponse } from "../_brand.js";

export async function onRequestGet(context) {
  const origin = new URL(context.request.url).origin;
  return htmlResponse(page("Checkout cancelled", `<h1>Checkout cancelled</h1>
    <p>No charge was made. You can pick a plan again whenever you're ready.</p>
    <a class="btn" href="${origin}/subscribe">See plans</a>
    <p class="muted"><a href="${origin}/">Back to capioplan.com</a></p>`));
}
