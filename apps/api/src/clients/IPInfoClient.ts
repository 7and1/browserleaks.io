import axios, { AxiosInstance } from 'axios';
import { config } from '../config';
import type { IPLeakResult } from '@browserleaks/types';

export class IPInfoClient {
  private client: AxiosInstance;
  private token: string;

  constructor() {
    this.token = config.IPINFO_TOKEN || '';

    this.client = axios.create({
      baseURL: 'https://ipinfo.io',
      timeout: 5000,
      headers: {
        'User-Agent': 'BrowserLeaks/1.0',
      },
    });
  }

  async lookup(ip?: string): Promise<IPLeakResult> {
    try {
      const url = ip ? `/${ip}/json` : `/json`;
      const params = this.token ? { token: this.token } : {};

      const response = await this.client.get(url, { params });
      const data = response.data;

      // Transform IPInfo response to our format
      return this.transformResponse(data);
    } catch (error) {
      console.error('IPInfo lookup error:', error);
      throw new Error('Failed to lookup IP information');
    }
  }

  private transformResponse(data: any): IPLeakResult {
    // Parse location
    const [latitude, longitude] = (data.loc || '0,0').split(',').map(Number);

    return {
      ip: data.ip,
      version: data.ip.includes(':') ? 'ipv6' : 'ipv4',
      geo: {
        country: data.country || 'Unknown',
        countryCode: data.country || 'XX',
        city: data.city || 'Unknown',
        region: data.region || 'Unknown',
        latitude,
        longitude,
        timezone: data.timezone || 'UTC',
        postalCode: data.postal,
      },
      network: {
        isp: data.org || 'Unknown',
        asn: data.org?.match(/AS\d+/)?.[0] || 'Unknown',
        organization: data.org || 'Unknown',
      },
      privacy: {
        isProxy: data.privacy?.proxy === 'true',
        isVPN: data.privacy?.vpn === 'true',
        isDatacenter: data.company?.type === 'hosting' || data.privacy?.hosting === 'true',
        isTor: data.privacy?.tor === 'true',
        isRelay: data.privacy?.relay === 'true',
      },
      reputation: {
        score: this.calculateReputationScore(data),
        isBlacklisted: false,
        categories: [],
      },
    };
  }

  private calculateReputationScore(data: any): number {
    let score = 100;

    // Deduct points based on privacy flags
    if (data.privacy?.proxy) score -= 20;
    if (data.privacy?.tor) score -= 30;
    if (data.privacy?.hosting) score -= 15;
    if (data.abuse?.score) score -= data.abuse.score * 10;

    return Math.max(0, Math.min(100, score));
  }
}
