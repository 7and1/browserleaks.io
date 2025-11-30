/**
 * Worker that proxies JA3 lookups so the API never calls ja3er.com directly.
 */
export default {
  async fetch(request: Request): Promise<Response> {
    const upstream = await fetch('https://ja3er.com/json');
    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      },
    });
  },
};
