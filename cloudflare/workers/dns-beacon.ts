export interface Env {
  DNS_LOGS: D1Database;
}

/**
 * Cloudflare Worker that receives beaconed DNS queries such as
 *    https://dns.browserleaks.io/beacon?scan_id=blk_123
 * and stores the resolver + colo info inside a D1 table.
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const scanId = url.searchParams.get('scan_id') || crypto.randomUUID();
    const cf = (request as Request & { cf?: IncomingRequestCf }).cf;

    await env.DNS_LOGS.prepare(
      `INSERT INTO leak_logs (id, created_at, resolver_ip, resolver_country, colo)
       VALUES (?1, datetime('now'), ?2, ?3, ?4)`
    )
      .bind(scanId, request.headers.get('cf-connecting-ip'), cf?.country || '??', cf?.colo || '??')
      .run();

    return new Response(
      JSON.stringify({
        scanId,
        resolver: request.headers.get('cf-connecting-ip'),
        colo: cf?.colo,
        country: cf?.country,
      }),
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
        },
      }
    );
  },
};
