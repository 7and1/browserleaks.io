/**
 * Database Service
 *
 * Handles all database operations for scans, fingerprints, and analytics.
 */

import { prisma } from '../lib/prisma';
import { RiskLevel, LeakType, Prisma } from '@prisma/client';
import { createHash } from 'crypto';

// Types
export interface CreateScanInput {
  visitorId: string;
  sessionId: string;
  userAgent: string;
  ip?: string;
  country?: string;
  city?: string;
}

export interface FingerprintInput {
  canvas?: {
    hash: string;
    winding: boolean;
  };
  webgl?: {
    hash: string;
    vendor: string;
    renderer: string;
  };
  audio?: {
    hash: string;
    value: number;
  };
  fonts?: {
    hash: string;
    count: number;
    list: string[];
  };
  timezone?: {
    name: string;
    offset: number;
  };
  screen?: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  navigator?: {
    platform: string;
    language: string;
    languages: string[];
    hardwareConcurrency: number;
    deviceMemory?: number;
    maxTouchPoints: number;
  };
  browser?: {
    engine: string;
    isMobile: boolean;
    isChromium: boolean;
    isGecko: boolean;
    isWebKit: boolean;
  };
}

export interface IPLeakInput {
  ip: string;
  version?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  timezone?: string;
  latitude?: number;
  longitude?: number;
  asnNumber?: number;
  asnName?: string;
  asnOrganization?: string;
  isProxy?: boolean;
  isVpn?: boolean;
  isTor?: boolean;
  isDatacenter?: boolean;
  isRelay?: boolean;
  reputationScore?: number;
  isBlacklisted?: boolean;
  dataSource?: string;
}

export interface DNSLeakInput {
  testId: string;
  isLeak: boolean;
  leakType: 'NONE' | 'PARTIAL' | 'FULL';
  servers: Array<{
    ip: string;
    hostname?: string;
    isp?: string;
    country?: string;
  }>;
  dohEnabled?: boolean;
  dotEnabled?: boolean;
  usingIspDns?: boolean;
  risks?: string[];
  recommendations?: string[];
}

export interface WebRTCLeakInput {
  isLeak: boolean;
  localIPs: string[];
  publicIP?: string;
  ipv6?: string;
  localIPLeak?: boolean;
  publicIPLeak?: boolean;
  mdnsLeak?: boolean;
  ipv6Leak?: boolean;
  natType?: string;
  risks?: string[];
  recommendations?: string[];
}

export interface PrivacyScoreInput {
  visitorId: string;
  totalScore: number;
  ipPrivacy: number;
  dnsPrivacy: number;
  webrtcPrivacy: number;
  fingerprintResistance: number;
  browserConfig: number;
}

class DatabaseService {
  /**
   * Create a new scan record
   */
  async createScan(input: CreateScanInput) {
    return prisma.scan.create({
      data: {
        visitorId: input.visitorId,
        sessionId: input.sessionId,
        userAgent: input.userAgent,
        ip: input.ip,
        country: input.country,
        city: input.city,
        totalScore: 0,
        riskLevel: RiskLevel.HIGH,
      },
    });
  }

  /**
   * Get scan by ID with all related data
   */
  async getScan(scanId: string) {
    return prisma.scan.findUnique({
      where: { id: scanId },
      include: {
        fingerprint: true,
        ipLeak: true,
        dnsLeak: true,
        webrtcLeak: true,
      },
    });
  }

  /**
   * Get scans by visitor ID
   */
  async getScansByVisitor(visitorId: string, limit = 10) {
    return prisma.scan.findMany({
      where: { visitorId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        fingerprint: true,
        ipLeak: true,
        dnsLeak: true,
        webrtcLeak: true,
      },
    });
  }

  /**
   * Save fingerprint data for a scan
   */
  async saveFingerprint(scanId: string, input: FingerprintInput) {
    // Generate combined hash
    const combinedHash = this.generateCombinedHash(input);

    // Calculate uniqueness score
    const uniquenessScore = await this.calculateUniquenessScore(combinedHash);

    return prisma.fingerprint.create({
      data: {
        scanId,
        canvasHash: input.canvas?.hash,
        canvasWinding: input.canvas?.winding,
        webglHash: input.webgl?.hash,
        webglVendor: input.webgl?.vendor,
        webglRenderer: input.webgl?.renderer,
        audioHash: input.audio?.hash,
        audioValue: input.audio?.value,
        fontHash: input.fonts?.hash,
        fontCount: input.fonts?.count,
        fonts: input.fonts?.list || [],
        timezone: input.timezone?.name,
        timezoneOffset: input.timezone?.offset,
        screenWidth: input.screen?.width,
        screenHeight: input.screen?.height,
        colorDepth: input.screen?.colorDepth,
        devicePixelRatio: input.screen?.pixelRatio,
        platform: input.navigator?.platform,
        language: input.navigator?.language,
        languages: input.navigator?.languages || [],
        hardwareConcurrency: input.navigator?.hardwareConcurrency,
        deviceMemory: input.navigator?.deviceMemory,
        maxTouchPoints: input.navigator?.maxTouchPoints,
        browserEngine: input.browser?.engine,
        isMobile: input.browser?.isMobile,
        isChromium: input.browser?.isChromium,
        isGecko: input.browser?.isGecko,
        isWebKit: input.browser?.isWebKit,
        combinedHash,
        uniquenessScore,
      },
    });
  }

  /**
   * Save IP leak data
   */
  async saveIPLeak(scanId: string, input: IPLeakInput) {
    return prisma.iPLeak.create({
      data: {
        scanId,
        ip: input.ip,
        version: input.version,
        country: input.country,
        countryCode: input.countryCode,
        city: input.city,
        region: input.region,
        timezone: input.timezone,
        latitude: input.latitude,
        longitude: input.longitude,
        asnNumber: input.asnNumber,
        asnName: input.asnName,
        asnOrganization: input.asnOrganization,
        isProxy: input.isProxy,
        isVpn: input.isVpn,
        isTor: input.isTor,
        isDatacenter: input.isDatacenter,
        isRelay: input.isRelay,
        reputationScore: input.reputationScore,
        isBlacklisted: input.isBlacklisted,
        dataSource: input.dataSource,
      },
    });
  }

  /**
   * Save DNS leak data
   */
  async saveDNSLeak(scanId: string, input: DNSLeakInput) {
    return prisma.dNSLeak.create({
      data: {
        scanId,
        testId: input.testId,
        isLeak: input.isLeak,
        leakType: LeakType[input.leakType],
        servers: input.servers as Prisma.JsonValue,
        serverCount: input.servers.length,
        dohEnabled: input.dohEnabled,
        dotEnabled: input.dotEnabled,
        usingIspDns: input.usingIspDns,
        risks: (input.risks || []) as Prisma.JsonValue,
        recommendations: (input.recommendations || []) as Prisma.JsonValue,
      },
    });
  }

  /**
   * Save WebRTC leak data
   */
  async saveWebRTCLeak(scanId: string, input: WebRTCLeakInput) {
    return prisma.webRTCLeak.create({
      data: {
        scanId,
        isLeak: input.isLeak,
        localIPs: input.localIPs,
        publicIP: input.publicIP,
        ipv6: input.ipv6,
        localIPLeak: input.localIPLeak,
        publicIPLeak: input.publicIPLeak,
        mdnsLeak: input.mdnsLeak,
        ipv6Leak: input.ipv6Leak,
        natType: input.natType,
        risks: (input.risks || []) as Prisma.JsonValue,
        recommendations: (input.recommendations || []) as Prisma.JsonValue,
      },
    });
  }

  /**
   * Save privacy score
   */
  async savePrivacyScore(input: PrivacyScoreInput) {
    const riskLevel = this.calculateRiskLevel(input.totalScore);

    return prisma.privacyScore.create({
      data: {
        visitorId: input.visitorId,
        totalScore: input.totalScore,
        riskLevel,
        ipPrivacy: input.ipPrivacy,
        dnsPrivacy: input.dnsPrivacy,
        webrtcPrivacy: input.webrtcPrivacy,
        fingerprintResistance: input.fingerprintResistance,
        browserConfig: input.browserConfig,
      },
    });
  }

  /**
   * Update scan with final score
   */
  async updateScanScore(scanId: string, totalScore: number) {
    const riskLevel = this.calculateRiskLevel(totalScore);

    return prisma.scan.update({
      where: { id: scanId },
      data: { totalScore, riskLevel },
    });
  }

  /**
   * Track telemetry event
   */
  async trackEvent(
    eventType: string,
    data: Record<string, unknown>,
    context?: { visitorId?: string; sessionId?: string; userAgent?: string; ip?: string; country?: string }
  ) {
    return prisma.telemetryEvent.create({
      data: {
        eventType,
        data: data as Prisma.JsonValue,
        visitorId: context?.visitorId,
        sessionId: context?.sessionId,
        userAgent: context?.userAgent,
        ip: context?.ip,
        country: context?.country,
      },
    });
  }

  /**
   * Create share link for a scan
   */
  async createShareLink(scanId: string, options?: { expiresIn?: number; maxViews?: number }) {
    const code = this.generateShareCode();
    const expiresAt = options?.expiresIn
      ? new Date(Date.now() + options.expiresIn * 1000)
      : undefined;

    return prisma.shareLink.create({
      data: {
        code,
        scanId,
        expiresAt,
        maxViews: options?.maxViews,
      },
    });
  }

  /**
   * Get scan by share code
   */
  async getScanByShareCode(code: string) {
    const link = await prisma.shareLink.findUnique({
      where: { code },
    });

    if (!link) return null;

    // Check expiration
    if (link.expiresAt && link.expiresAt < new Date()) {
      return null;
    }

    // Check max views
    if (link.maxViews && link.viewCount >= link.maxViews) {
      return null;
    }

    // Increment view count
    await prisma.shareLink.update({
      where: { code },
      data: { viewCount: { increment: 1 } },
    });

    return this.getScan(link.scanId);
  }

  /**
   * Update or create shared fingerprint for uniqueness tracking
   */
  async updateSharedFingerprint(combinedHash: string, componentHashes: {
    canvasHash?: string;
    webglHash?: string;
    audioHash?: string;
    fontHash?: string;
  }) {
    return prisma.sharedFingerprint.upsert({
      where: { hash: combinedHash },
      create: {
        hash: combinedHash,
        ...componentHashes,
        seenCount: 1,
      },
      update: {
        seenCount: { increment: 1 },
        lastSeenAt: new Date(),
      },
    });
  }

  /**
   * Get fingerprint statistics
   */
  async getFingerprintStats() {
    const [totalFingerprints, uniqueFingerprints, recentScans] = await Promise.all([
      prisma.fingerprint.count(),
      prisma.sharedFingerprint.count(),
      prisma.scan.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    return {
      totalFingerprints,
      uniqueFingerprints,
      recentScans,
      uniquenessRatio: totalFingerprints > 0 ? uniqueFingerprints / totalFingerprints : 0,
    };
  }

  // Private helper methods

  private generateCombinedHash(input: FingerprintInput): string {
    const parts = [
      input.canvas?.hash || '',
      input.webgl?.hash || '',
      input.audio?.hash || '',
      input.fonts?.hash || '',
      input.timezone?.name || '',
      input.screen ? `${input.screen.width}x${input.screen.height}` : '',
      input.navigator?.platform || '',
    ].join('|');

    return createHash('sha256').update(parts).digest('hex');
  }

  private async calculateUniquenessScore(combinedHash: string): Promise<number> {
    // Check how many times this fingerprint has been seen
    const existing = await prisma.sharedFingerprint.findUnique({
      where: { hash: combinedHash },
    });

    const totalFingerprints = await prisma.sharedFingerprint.aggregate({
      _sum: { seenCount: true },
    });

    const total = totalFingerprints._sum.seenCount || 1;
    const seen = existing?.seenCount || 0;

    // Calculate uniqueness (higher = more unique)
    // If never seen before, uniqueness is very high
    if (seen === 0) return 0.99;

    // Calculate as inverse of frequency
    const frequency = seen / total;
    return Math.max(0, Math.min(1, 1 - frequency));
  }

  private calculateRiskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.LOW;
    if (score >= 60) return RiskLevel.MEDIUM;
    if (score >= 40) return RiskLevel.HIGH;
    return RiskLevel.CRITICAL;
  }

  private generateShareCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 12; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
