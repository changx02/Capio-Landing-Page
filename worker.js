export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const incoming = new URLSearchParams(await request.text());

    // Forward the user's real IP and Cloudflare-derived geolocation as
    // custom fields. Launchlist's built-in Location/IP columns will still
    // reflect the Worker's egress, but these custom fields will be accurate.
    const cf = request.cf || {};
    const userIp = request.headers.get('cf-connecting-ip') || '';
    if (userIp) incoming.append('user_ip', userIp);
    if (cf.country) incoming.append('user_country', cf.country);
    if (cf.region) incoming.append('user_region', cf.region);
    if (cf.city) incoming.append('user_city', cf.city);
    if (cf.postalCode) incoming.append('user_postal', cf.postalCode);
    if (cf.timezone) incoming.append('user_timezone', cf.timezone);

    const response = await fetch('https://getlaunchlist.com/s/e706GY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: incoming.toString()
    });

    const html = await response.text();

    // Extract referral ID from redirect URL
    const match = html.match(/ref=([A-Za-z0-9]+)/);
    const refId = match ? match[1] : null;

    return new Response(JSON.stringify({ refId }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'https://capioplan.com'
      }
    });
  }
};
