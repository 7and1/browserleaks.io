import { IPInfoClient } from '../clients/IPInfoClient';
import type { IPLeakResult } from '@browserleaks/types';

export class IPService {
  private ipinfoClient: IPInfoClient;

  constructor() {
    this.ipinfoClient = new IPInfoClient();
  }

  async detect(ip?: string): Promise<IPLeakResult> {
    try {
      // Get IP information from IPInfo
      const result = await this.ipinfoClient.lookup(ip);

      // Additional processing can be added here
      // - Check against blacklists
      // - Enhance with additional data sources
      // - Cache results

      return result;
    } catch (error) {
      console.error('IP detection error:', error);
      throw error;
    }
  }

  /**
   * Extract client IP from request headers
   */
  getClientIP(req: any): string {
    const cfIp = req.headers['cf-connecting-ip'];
    const forwardedFor = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    if (cfIp) return cfIp;
    if (forwardedFor) return forwardedFor.split(',')[0].trim();
    if (realIp) return realIp;

    return req.ip || req.connection.remoteAddress;
  }
}
