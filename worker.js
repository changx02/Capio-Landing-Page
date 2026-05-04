export default {
  async fetch(request) {
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    const body = await request.text();

    const response = await fetch('https://getlaunchlist.com/s/e706GY', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body
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
