/**
 * IP Intelligence Service
 *
 * Multi-source IP intelligence gathering from:
 * - my-ip-data API (primary - 8M+ records)
 * - Cloudflare Radar API (ASN/organization data)
 * - IPInfo.io API (backup)
 */

import axios, { AxiosInstance } from 'axios';
import { createHash } from 'crypto';

// Types
export interface IPIntelligence {
  ip: string;
  version: 'ipv4' | 'ipv6';

  // Geolocation
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;

  // Network
  asnNumber?: number;
  asnName?: string;
  asnOrganization?: string;
  isp?: string;

  // Privacy indicators
  isProxy?: boolean;
  isVpn?: boolean;
  isTor?: boolean;
  isDatacenter?: boolean;
  isRelay?: boolean;
  isCrawler?: boolean;

  // Reputation
  reputationScore?: number;
  isBlacklisted?: boolean;
  threatTypes?: string[];

  // Meta
  sources: string[];
  confidence: number;
  cachedAt?: Date;
}

interface MyIPDataResponse {
  success: boolean;
  data: {
    ip: string;
    country: string;
    country_code: string;
    region: string;
    city: string;
    latitude: number;
    longitude: number;
    timezone: string;
    asn: number;
    asn_name: string;
    asn_org: string;
    is_proxy: boolean;
    is_vpn: boolean;
    is_tor: boolean;
    is_datacenter: boolean;
  };
}

interface CloudflareRadarASNResponse {
  success: boolean;
  result: {
    asn: {
      asn: number;
      name: string;
      countryCode: string;
      orgName: string;
      website?: string;
    };
  };
}

interface IPInfoResponse {
  ip: string;
  city: string;
  region: string;
  country: string;
  loc: string;
  org: string;
  postal: string;
  timezone: string;
  hostname?: string;
  privacy?: {
    vpn: boolean;
    proxy: boolean;
    tor: boolean;
    relay: boolean;
    hosting: boolean;
  };
}

// Simple in-memory LRU cache
class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxSize: number;
  private ttlMs: number;

  constructor(maxSize = 1000, ttlMinutes = 60) {
    this.maxSize = maxSize;
    this.ttlMs = ttlMinutes * 60 * 1000;
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return undefined;
    }

    // Move to end (most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      // Delete oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  clear(): void {
    this.cache.clear();
  }
}

class IPIntelligenceService {
  private myIPDataClient: AxiosInstance;
  private cloudflareClient: AxiosInstance;
  private ipinfoClient: AxiosInstance;
  private cache: LRUCache<IPIntelligence>;

  constructor() {
    // my-ip-data API client
    this.myIPDataClient = axios.create({
      baseURL: process.env.MY_IP_DATA_URL || 'https://data.ipaddress.cv',
      timeout: 5000,
    });

    // Cloudflare Radar API client
    this.cloudflareClient = axios.create({
      baseURL: 'https://api.cloudflare.com/client/v4/radar',
      timeout: 5000,
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_RADAR_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    // IPInfo.io API client (backup)
    this.ipinfoClient = axios.create({
      baseURL: 'https://ipinfo.io',
      timeout: 5000,
      params: {
        token: process.env.IPINFO_TOKEN,
      },
    });

    // Initialize cache (1000 entries, 1 hour TTL)
    this.cache = new LRUCache<IPIntelligence>(1000, 60);
  }

  /**
   * Get comprehensive IP intelligence from multiple sources
   */
  async getIPIntelligence(ip: string): Promise<IPIntelligence> {
    // Check cache first
    const cached = this.cache.get(ip);
    if (cached) {
      return { ...cached, cachedAt: new Date() };
    }

    const result: IPIntelligence = {
      ip,
      version: this.detectIPVersion(ip),
      sources: [],
      confidence: 0,
    };

    // Fetch from all sources in parallel
    const [myIPData, cloudflareData, ipinfoData] = await Promise.allSettled([
      this.fetchFromMyIPData(ip),
      this.fetchASNFromCloudflare(ip),
      this.fetchFromIPInfo(ip),
    ]);

    // Merge results (priority: my-ip-data > ipinfo > cloudflare)
    if (myIPData.status === 'fulfilled' && myIPData.value) {
      this.mergeMyIPData(result, myIPData.value);
      result.sources.push('my-ip-data');
      result.confidence += 0.5;
    }

    if (ipinfoData.status === 'fulfilled' && ipinfoData.value) {
      this.mergeIPInfoData(result, ipinfoData.value);
      result.sources.push('ipinfo');
      result.confidence += 0.3;
    }

    if (cloudflareData.status === 'fulfilled' && cloudflareData.value) {
      this.mergeCloudflareData(result, cloudflareData.value);
      result.sources.push('cloudflare-radar');
      result.confidence += 0.2;
    }

    // Normalize confidence to 0-1
    result.confidence = Math.min(result.confidence, 1);

    // Calculate reputation score
    result.reputationScore = this.calculateReputationScore(result);

    // Cache the result
    this.cache.set(ip, result);

    return result;
  }

  /**
   * Fetch from my-ip-data API (primary source)
   */
  private async fetchFromMyIPData(ip: string): Promise<MyIPDataResponse['data'] | null> {
    try {
      const response = await this.myIPDataClient.get<MyIPDataResponse>(`/v1/ip/${ip}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.warn(`my-ip-data API error for ${ip}:`, error);
      return null;
    }
  }

  /**
   * Fetch ASN data from Cloudflare Radar
   */
  private async fetchASNFromCloudflare(ip: string): Promise<CloudflareRadarASNResponse['result'] | null> {
    try {
      // Cloudflare Radar doesn't have direct IP lookup, so we skip if no ASN
      // This would typically be used after we have an ASN from another source
      return null;
    } catch (error) {
      console.warn(`Cloudflare Radar API error for ${ip}:`, error);
      return null;
    }
  }

  /**
   * Fetch from IPInfo.io API (backup)
   */
  private async fetchFromIPInfo(ip: string): Promise<IPInfoResponse | null> {
    try {
      const response = await this.ipinfoClient.get<IPInfoResponse>(`/${ip}`);
      return response.data;
    } catch (error) {
      console.warn(`IPInfo API error for ${ip}:`, error);
      return null;
    }
  }

  /**
   * Merge my-ip-data response
   */
  private mergeMyIPData(result: IPIntelligence, data: MyIPDataResponse['data']): void {
    result.country = data.country;
    result.countryCode = data.country_code;
    result.region = data.region;
    result.city = data.city;
    result.latitude = data.latitude;
    result.longitude = data.longitude;
    result.timezone = data.timezone;
    result.asnNumber = data.asn;
    result.asnName = data.asn_name;
    result.asnOrganization = data.asn_org;
    result.isProxy = data.is_proxy;
    result.isVpn = data.is_vpn;
    result.isTor = data.is_tor;
    result.isDatacenter = data.is_datacenter;
  }

  /**
   * Merge IPInfo response (fills gaps)
   */
  private mergeIPInfoData(result: IPIntelligence, data: IPInfoResponse): void {
    if (!result.city) result.city = data.city;
    if (!result.region) result.region = data.region;
    if (!result.countryCode) result.countryCode = data.country;
    if (!result.timezone) result.timezone = data.timezone;

    if (data.loc) {
      const [lat, lon] = data.loc.split(',').map(Number);
      if (!result.latitude) result.latitude = lat;
      if (!result.longitude) result.longitude = lon;
    }

    if (data.org) {
      const match = data.org.match(/^AS(\d+)\s+(.+)$/);
      if (match) {
        if (!result.asnNumber) result.asnNumber = parseInt(match[1]);
        if (!result.asnOrganization) result.asnOrganization = match[2];
      }
    }

    if (data.privacy) {
      if (result.isVpn === undefined) result.isVpn = data.privacy.vpn;
      if (result.isProxy === undefined) result.isProxy = data.privacy.proxy;
      if (result.isTor === undefined) result.isTor = data.privacy.tor;
      if (result.isRelay === undefined) result.isRelay = data.privacy.relay;
      if (result.isDatacenter === undefined) result.isDatacenter = data.privacy.hosting;
    }
  }

  /**
   * Merge Cloudflare Radar response
   */
  private mergeCloudflareData(result: IPIntelligence, data: CloudflareRadarASNResponse['result']): void {
    if (data.asn) {
      if (!result.asnNumber) result.asnNumber = data.asn.asn;
      if (!result.asnName) result.asnName = data.asn.name;
      if (!result.asnOrganization) result.asnOrganization = data.asn.orgName;
    }
  }

  /**
   * Calculate reputation score (0-100, higher is better)
   */
  private calculateReputationScore(data: IPIntelligence): number {
    let score = 100;

    // Deduct for privacy indicators
    if (data.isProxy) score -= 15;
    if (data.isVpn) score -= 10; // VPN is less suspicious than proxy
    if (data.isTor) score -= 25;
    if (data.isDatacenter) score -= 20;
    if (data.isRelay) score -= 5;
    if (data.isCrawler) score -= 10;

    // Deduct for low confidence
    if (data.confidence < 0.5) score -= 10;
    if (data.confidence < 0.3) score -= 10;

    // Deduct for missing geo data
    if (!data.country) score -= 5;
    if (!data.city) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Detect IP version
   */
  private detectIPVersion(ip: string): 'ipv4' | 'ipv6' {
    return ip.includes(':') ? 'ipv6' : 'ipv4';
  }

  /**
   * Get client IP from request headers
   */
  getClientIP(headers: Record<string, string | string[] | undefined>): string {
    // Try various headers in order of preference
    const headerNames = [
      'cf-connecting-ip',    // Cloudflare
      'x-real-ip',           // Nginx
      'x-forwarded-for',     // Standard proxy header
      'x-client-ip',         // Various proxies
      'true-client-ip',      // Akamai
    ];

    for (const header of headerNames) {
      const value = headers[header];
      if (value) {
        const ip = Array.isArray(value) ? value[0] : value.split(',')[0].trim();
        if (this.isValidIP(ip)) {
          return ip;
        }
      }
    }

    return '0.0.0.0';
  }

  /**
   * Validate IP address
   */
  isValidIP(ip: string): boolean {
    // IPv4
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipv4Regex.test(ip)) {
      const parts = ip.split('.').map(Number);
      return parts.every(p => p >= 0 && p <= 255);
    }

    // IPv6 (simplified check)
    const ipv6Regex = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
    return ipv6Regex.test(ip);
  }

  /**
   * Hash IP for privacy
   */
  hashIP(ip: string): string {
    return createHash('sha256').update(ip).digest('hex').substring(0, 16);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const ipIntelligenceService = new IPIntelligenceService();
export default ipIntelligenceService;
