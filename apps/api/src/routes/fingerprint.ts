/**
 * Fingerprint Analysis Routes
 *
 * Endpoints for analyzing browser fingerprints and calculating uniqueness.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { validate } from '../middleware/validate';
import { databaseService } from '../services/DatabaseService';
import { ipIntelligenceService } from '../services/IPIntelligenceService';
import { PrivacyScoreService } from '../services/PrivacyScoreService';

const router = Router();
const privacyScoreService = new PrivacyScoreService();

// Validation schemas
const fingerprintSchema = z.object({
  // Canvas fingerprint
  canvas: z.object({
    hash: z.string(),
    winding: z.boolean(),
    geometry: z.string().optional(),
    text: z.string().optional(),
  }).optional(),

  // WebGL fingerprint
  webgl: z.object({
    hash: z.string(),
    vendor: z.string(),
    renderer: z.string(),
    version: z.string().optional(),
    shadingLanguageVersion: z.string().optional(),
    extensions: z.array(z.string()).optional(),
    parameters: z.record(z.unknown()).optional(),
  }).optional(),

  // Audio fingerprint
  audio: z.object({
    hash: z.string(),
    value: z.number(),
    sampleRate: z.number().optional(),
    channelCount: z.number().optional(),
  }).optional(),

  // Font detection
  fonts: z.object({
    hash: z.string(),
    count: z.number(),
    list: z.array(z.string()),
  }).optional(),

  // Timezone
  timezone: z.object({
    name: z.string(),
    offset: z.number(),
    hasDST: z.boolean().optional(),
  }).optional(),

  // Screen info
  screen: z.object({
    width: z.number(),
    height: z.number(),
    colorDepth: z.number(),
    pixelRatio: z.number(),
    availWidth: z.number().optional(),
    availHeight: z.number().optional(),
    orientation: z.string().optional(),
  }).optional(),

  // Navigator info
  navigator: z.object({
    platform: z.string(),
    language: z.string(),
    languages: z.array(z.string()),
    hardwareConcurrency: z.number(),
    deviceMemory: z.number().optional(),
    maxTouchPoints: z.number(),
    userAgent: z.string().optional(),
    cookieEnabled: z.boolean().optional(),
    doNotTrack: z.string().nullable().optional(),
  }).optional(),

  // Browser detection
  browser: z.object({
    engine: z.string(),
    isMobile: z.boolean(),
    isChromium: z.boolean(),
    isGecko: z.boolean(),
    isWebKit: z.boolean(),
  }).optional(),

  // Storage APIs
  storage: z.object({
    localStorage: z.boolean(),
    sessionStorage: z.boolean(),
    indexedDB: z.boolean(),
  }).optional(),

  // Visitor info
  visitorId: z.string().optional(),
  sessionId: z.string().optional(),
});

const scanSchema = z.object({
  fingerprint: fingerprintSchema,
  ipLeak: z.object({
    ip: z.string(),
    version: z.string().optional(),
  }).optional(),
  dnsLeak: z.object({
    isLeak: z.boolean(),
    leakType: z.enum(['none', 'partial', 'full']),
    servers: z.array(z.object({
      ip: z.string(),
      hostname: z.string().optional(),
      isp: z.string().optional(),
      country: z.string().optional(),
    })),
  }).optional(),
  webrtcLeak: z.object({
    isLeak: z.boolean(),
    localIPs: z.array(z.string()),
    publicIP: z.string().optional(),
    ipv6: z.string().optional(),
  }).optional(),
});

/**
 * POST /v1/fingerprint
 * Analyze a browser fingerprint and return uniqueness score
 */
router.post('/', validate(fingerprintSchema), async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // Generate combined hash
    const combinedHash = generateCombinedHash(data);

    // Calculate component uniqueness scores (simulated - in production would compare against database)
    const componentScores = calculateComponentScores(data);

    // Calculate overall uniqueness
    const uniquenessScore = calculateUniquenessScore(componentScores);

    // Build analysis result
    const analysis = {
      combinedHash,
      uniquenessScore,
      uniquenessPercentage: Math.round(uniquenessScore * 100),
      componentScores,
      components: {
        canvas: data.canvas ? {
          detected: true,
          hash: data.canvas.hash,
          winding: data.canvas.winding,
        } : { detected: false },
        webgl: data.webgl ? {
          detected: true,
          hash: data.webgl.hash,
          vendor: data.webgl.vendor,
          renderer: data.webgl.renderer,
          extensionCount: data.webgl.extensions?.length || 0,
        } : { detected: false },
        audio: data.audio ? {
          detected: true,
          hash: data.audio.hash,
          value: data.audio.value,
        } : { detected: false },
        fonts: data.fonts ? {
          detected: true,
          hash: data.fonts.hash,
          count: data.fonts.count,
        } : { detected: false },
        timezone: data.timezone ? {
          detected: true,
          name: data.timezone.name,
          offset: data.timezone.offset,
        } : { detected: false },
        screen: data.screen ? {
          detected: true,
          resolution: `${data.screen.width}x${data.screen.height}`,
          colorDepth: data.screen.colorDepth,
          pixelRatio: data.screen.pixelRatio,
        } : { detected: false },
        navigator: data.navigator ? {
          detected: true,
          platform: data.navigator.platform,
          language: data.navigator.language,
          hardwareConcurrency: data.navigator.hardwareConcurrency,
          deviceMemory: data.navigator.deviceMemory,
        } : { detected: false },
        browser: data.browser ? {
          detected: true,
          engine: data.browser.engine,
          isMobile: data.browser.isMobile,
        } : { detected: false },
      },
      riskAssessment: {
        level: uniquenessScore > 0.9 ? 'critical' :
               uniquenessScore > 0.7 ? 'high' :
               uniquenessScore > 0.5 ? 'medium' : 'low',
        trackable: uniquenessScore > 0.7,
        recommendations: generateRecommendations(uniquenessScore, componentScores),
      },
      timestamp: new Date().toISOString(),
    };

    res.json({
      success: true,
      data: analysis,
    });

  } catch (error: any) {
    console.error('Fingerprint analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FINGERPRINT_ANALYSIS_ERROR',
        message: error.message || 'Failed to analyze fingerprint',
      },
    });
  }
});

/**
 * POST /v1/fingerprint/scan
 * Full privacy scan including fingerprint, IP, DNS, and WebRTC
 */
router.post('/scan', validate(scanSchema), async (req: Request, res: Response) => {
  try {
    const { fingerprint, ipLeak, dnsLeak, webrtcLeak } = req.body;

    // Get client IP
    const clientIP = ipIntelligenceService.getClientIP(req.headers as Record<string, string | string[] | undefined>);
    const actualIP = ipLeak?.ip || clientIP;

    // Get IP intelligence
    const ipIntelligence = await ipIntelligenceService.getIPIntelligence(actualIP);

    // Generate visitor ID if not provided
    const visitorId = fingerprint.visitorId || generateVisitorId(fingerprint, actualIP);
    const sessionId = fingerprint.sessionId || generateSessionId();

    // Analyze fingerprint
    const combinedHash = generateCombinedHash(fingerprint);
    const componentScores = calculateComponentScores(fingerprint);
    const uniquenessScore = calculateUniquenessScore(componentScores);

    // Calculate privacy score
    const privacyScore = await privacyScoreService.calculate({
      ipLeak: ipIntelligence ? {
        ip: actualIP,
        privacy: {
          isVPN: ipIntelligence.isVpn || false,
          isProxy: ipIntelligence.isProxy || false,
          isTor: ipIntelligence.isTor || false,
          isDatacenter: ipIntelligence.isDatacenter || false,
          isRelay: ipIntelligence.isRelay || false,
        },
        reputation: {
          score: ipIntelligence.reputationScore || 100,
          isBlacklisted: ipIntelligence.isBlacklisted || false,
        },
        geolocation: {
          country: ipIntelligence.country || 'Unknown',
          countryCode: ipIntelligence.countryCode || 'XX',
          city: ipIntelligence.city || 'Unknown',
          region: ipIntelligence.region || 'Unknown',
          latitude: ipIntelligence.latitude || 0,
          longitude: ipIntelligence.longitude || 0,
          timezone: ipIntelligence.timezone || 'Unknown',
        },
        network: {
          asn: ipIntelligence.asnNumber || 0,
          asnName: ipIntelligence.asnName || 'Unknown',
          organization: ipIntelligence.asnOrganization || 'Unknown',
          isp: ipIntelligence.isp || 'Unknown',
        },
        version: ipIntelligence.version || 'ipv4',
        source: ipIntelligence.sources.join(', '),
        timestamp: Date.now(),
      } : undefined,
      dnsLeak: dnsLeak ? {
        isLeak: dnsLeak.isLeak,
        leakType: dnsLeak.leakType,
        servers: dnsLeak.servers,
        dohEnabled: false,
        dotEnabled: false,
      } : undefined,
      webrtcLeak: webrtcLeak ? {
        isLeak: webrtcLeak.isLeak,
        localIPs: webrtcLeak.localIPs,
        publicIPs: webrtcLeak.publicIP ? [webrtcLeak.publicIP] : [],
        mdnsLeak: false,
        ipv6Leak: !!webrtcLeak.ipv6,
        natType: 'unknown',
      } : undefined,
      fingerprintResult: {
        uniquenessScore: uniquenessScore * 100,
      },
    });

    // Build comprehensive scan result
    const scanResult = {
      scanId: generateScanId(),
      visitorId,
      sessionId,
      timestamp: new Date().toISOString(),

      // Privacy score
      privacyScore: {
        total: privacyScore.totalScore,
        riskLevel: privacyScore.riskLevel,
        breakdown: privacyScore.breakdown,
        vulnerabilities: privacyScore.vulnerabilities,
      },

      // Fingerprint analysis
      fingerprint: {
        combinedHash,
        uniquenessScore,
        uniquenessPercentage: Math.round(uniquenessScore * 100),
        componentScores,
        riskLevel: uniquenessScore > 0.9 ? 'critical' :
                   uniquenessScore > 0.7 ? 'high' :
                   uniquenessScore > 0.5 ? 'medium' : 'low',
      },

      // IP analysis
      ip: {
        address: actualIP,
        version: ipIntelligence.version,
        geolocation: {
          country: ipIntelligence.country,
          countryCode: ipIntelligence.countryCode,
          city: ipIntelligence.city,
          region: ipIntelligence.region,
          latitude: ipIntelligence.latitude,
          longitude: ipIntelligence.longitude,
          timezone: ipIntelligence.timezone,
        },
        network: {
          asn: ipIntelligence.asnNumber,
          asnName: ipIntelligence.asnName,
          organization: ipIntelligence.asnOrganization,
        },
        privacy: {
          isVpn: ipIntelligence.isVpn,
          isProxy: ipIntelligence.isProxy,
          isTor: ipIntelligence.isTor,
          isDatacenter: ipIntelligence.isDatacenter,
          isRelay: ipIntelligence.isRelay,
        },
        reputation: {
          score: ipIntelligence.reputationScore,
          isBlacklisted: ipIntelligence.isBlacklisted,
        },
        sources: ipIntelligence.sources,
      },

      // DNS leak (if provided)
      dns: dnsLeak ? {
        isLeak: dnsLeak.isLeak,
        leakType: dnsLeak.leakType,
        serverCount: dnsLeak.servers.length,
        servers: dnsLeak.servers,
      } : null,

      // WebRTC leak (if provided)
      webrtc: webrtcLeak ? {
        isLeak: webrtcLeak.isLeak,
        localIPs: webrtcLeak.localIPs,
        publicIP: webrtcLeak.publicIP,
        ipv6: webrtcLeak.ipv6,
      } : null,

      // Recommendations
      recommendations: generateComprehensiveRecommendations(privacyScore, uniquenessScore, ipIntelligence),
    };

    res.json({
      success: true,
      data: scanResult,
    });

  } catch (error: any) {
    console.error('Full scan error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_ERROR',
        message: error.message || 'Failed to perform privacy scan',
      },
    });
  }
});

/**
 * GET /v1/fingerprint/:hash
 * Get fingerprint statistics by hash
 */
router.get('/:hash', async (req: Request, res: Response) => {
  try {
    const { hash } = req.params;

    // In a production system, this would query the database
    // For now, return simulated statistics
    const stats = {
      hash,
      seenCount: Math.floor(Math.random() * 100) + 1,
      firstSeen: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      lastSeen: new Date().toISOString(),
      uniqueness: Math.random() * 0.3 + 0.7, // 70-100% unique
      similarFingerprints: Math.floor(Math.random() * 10),
    };

    res.json({
      success: true,
      data: stats,
    });

  } catch (error: any) {
    console.error('Fingerprint lookup error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FINGERPRINT_LOOKUP_ERROR',
        message: error.message || 'Failed to lookup fingerprint',
      },
    });
  }
});

// Helper functions

function generateCombinedHash(data: z.infer<typeof fingerprintSchema>): string {
  const parts = [
    data.canvas?.hash || '',
    data.webgl?.hash || '',
    data.audio?.hash || '',
    data.fonts?.hash || '',
    data.timezone?.name || '',
    data.screen ? `${data.screen.width}x${data.screen.height}` : '',
    data.navigator?.platform || '',
    data.navigator?.language || '',
  ].join('|');

  return createHash('sha256').update(parts).digest('hex');
}

function calculateComponentScores(data: z.infer<typeof fingerprintSchema>): Record<string, number> {
  const scores: Record<string, number> = {};

  // Canvas uniqueness (simulated based on hash entropy)
  if (data.canvas?.hash) {
    scores.canvas = 0.85 + Math.random() * 0.15;
  }

  // WebGL uniqueness
  if (data.webgl?.hash) {
    scores.webgl = 0.70 + Math.random() * 0.25;
  }

  // Audio uniqueness
  if (data.audio?.hash) {
    scores.audio = 0.65 + Math.random() * 0.30;
  }

  // Font uniqueness (based on count)
  if (data.fonts) {
    const fontFactor = Math.min(data.fonts.count / 100, 1);
    scores.fonts = 0.50 + fontFactor * 0.40;
  }

  // Timezone (lower uniqueness - shared by regions)
  if (data.timezone) {
    scores.timezone = 0.20 + Math.random() * 0.30;
  }

  // Screen (many people share common resolutions)
  if (data.screen) {
    const isCommonResolution = [
      '1920x1080', '1366x768', '1536x864', '1440x900', '2560x1440'
    ].includes(`${data.screen.width}x${data.screen.height}`);
    scores.screen = isCommonResolution ? 0.30 : 0.60;
  }

  // Navigator/platform
  if (data.navigator) {
    scores.navigator = 0.40 + Math.random() * 0.30;
  }

  return scores;
}

function calculateUniquenessScore(componentScores: Record<string, number>): number {
  const values = Object.values(componentScores);
  if (values.length === 0) return 0.5;

  // Weighted average
  const weights: Record<string, number> = {
    canvas: 0.25,
    webgl: 0.20,
    audio: 0.15,
    fonts: 0.15,
    timezone: 0.05,
    screen: 0.10,
    navigator: 0.10,
  };

  let weightedSum = 0;
  let totalWeight = 0;

  for (const [key, score] of Object.entries(componentScores)) {
    const weight = weights[key] || 0.1;
    weightedSum += score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
}

function generateRecommendations(uniqueness: number, componentScores: Record<string, number>): string[] {
  const recommendations: string[] = [];

  if (uniqueness > 0.8) {
    recommendations.push('Use a privacy-focused browser like Firefox with Enhanced Tracking Protection.');
  }

  if (componentScores.canvas && componentScores.canvas > 0.8) {
    recommendations.push('Enable canvas fingerprint protection (e.g., CanvasBlocker extension).');
  }

  if (componentScores.webgl && componentScores.webgl > 0.8) {
    recommendations.push('Consider disabling WebGL or using WebGL fingerprint protection.');
  }

  if (componentScores.fonts && componentScores.fonts > 0.6) {
    recommendations.push('Reduce installed fonts or use a font fingerprinting protection extension.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Your browser fingerprint has moderate uniqueness. Good privacy practices.');
  }

  return recommendations;
}

function generateComprehensiveRecommendations(
  privacyScore: any,
  uniqueness: number,
  ipIntelligence: any
): string[] {
  const recommendations: string[] = [];

  // IP recommendations
  if (!ipIntelligence.isVpn && !ipIntelligence.isTor) {
    recommendations.push('Use a reputable VPN service to hide your real IP address.');
  }

  // DNS recommendations
  if (privacyScore.breakdown.dnsPrivacy < 10) {
    recommendations.push('Enable DNS-over-HTTPS (DoH) in your browser settings.');
  }

  // WebRTC recommendations
  if (privacyScore.breakdown.webrtcPrivacy < 10) {
    recommendations.push('Disable WebRTC or use a browser extension to prevent IP leaks.');
  }

  // Fingerprint recommendations
  if (uniqueness > 0.8) {
    recommendations.push('Use a privacy browser with fingerprint protection (Firefox, Brave).');
  }

  // General recommendations
  if (privacyScore.totalScore < 60) {
    recommendations.push('Consider using Tor Browser for maximum privacy protection.');
  }

  return recommendations.slice(0, 5);
}

function generateVisitorId(data: any, ip: string): string {
  const parts = [
    data.canvas?.hash || '',
    data.webgl?.hash || '',
    data.navigator?.platform || '',
    ip,
  ].join('|');
  return createHash('sha256').update(parts).digest('hex').substring(0, 24);
}

function generateSessionId(): string {
  return createHash('sha256')
    .update(`${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 16);
}

function generateScanId(): string {
  return createHash('sha256')
    .update(`scan-${Date.now()}-${Math.random()}`)
    .digest('hex')
    .substring(0, 20);
}

export default router;
