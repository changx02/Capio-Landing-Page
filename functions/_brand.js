// Shared branding for the checkout pages (Cloudflare Pages Functions).
// Mirrors index.html: DM Sans, cream #F5F0E8, ink #1A1A1A.

export const BRAND_STYLE = `
  :root {
    --cream: #F5F0E8; --ink: #1A1A1A; --muted: #6B6560;
    --line: #D4CFC6; --accent: #c0392b; --card: #FFFFFF;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100vh; background: var(--cream); color: var(--ink);
    font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    display: flex; align-items: center; justify-content: center; padding: 24px;
    line-height: 1.5;
  }
  .card {
    background: var(--card); border: 1px solid var(--line); border-radius: 16px;
    padding: 40px 32px; max-width: 440px; width: 100%; text-align: center;
  }
  h1 { font-size: 22px; margin: 0 0 8px; }
  p { color: var(--muted); font-size: 15px; margin: 8px 0; }
  .btn {
    display: inline-block; margin-top: 20px; padding: 14px 24px; border-radius: 10px;
    background: var(--ink); color: #fff; text-decoration: none; font-weight: 500; font-size: 15px;
  }
  .btn.secondary { background: transparent; color: var(--muted); padding: 8px; font-size: 14px; }
  .plans { display: grid; gap: 12px; margin-top: 20px; text-align: left; }
  .plan { display: flex; justify-content: space-between; align-items: center;
    border: 1px solid var(--line); border-radius: 12px; padding: 14px 16px;
    text-decoration: none; color: var(--ink); }
  .plan b { font-size: 16px; } .plan span { color: var(--muted); font-size: 14px; }
  .mono { font-family: ui-monospace, Menlo, monospace; font-size: 12px; word-break: break-all;
    background: var(--cream); border: 1px solid var(--line); border-radius: 8px; padding: 10px; color: var(--ink); }
  .muted { color: var(--muted); font-size: 13px; }
`;

export function page(title, bodyHTML) {
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} · Capio</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>${BRAND_STYLE}</style>
</head><body><div class="card">${bodyHTML}</div></body></html>`;
}

export function htmlResponse(html, status = 200) {
  return new Response(html, { status, headers: { "content-type": "text/html; charset=utf-8" } });
}

// (plan, billing) -> the env var holding that Stripe Price ID.
export const PRICE_ENV = {
  "pro|annual": "STRIPE_PRICE_PRO_ANNUAL",
  "pro|monthly": "STRIPE_PRICE_PRO_MONTHLY",
  "pro-plus|annual": "STRIPE_PRICE_PROPLUS_ANNUAL",
  "pro-plus|monthly": "STRIPE_PRICE_PROPLUS_MONTHLY",
};

export const PLAN_LABEL = {
  "pro|annual": ["Pro", "$34.99 / year"],
  "pro|monthly": ["Pro", "$3.99 / month"],
  "pro-plus|annual": ["Pro+", "$54.99 / year"],
  "pro-plus|monthly": ["Pro+", "$6.99 / month"],
};
