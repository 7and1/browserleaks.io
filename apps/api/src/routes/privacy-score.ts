import { Router } from 'express';
import { PrivacyScoreService } from '../services/PrivacyScoreService';
import type { APIResponse, PrivacyScore } from '@browserleaks/types';
import { telemetryService } from '../services/TelemetryService';

const router = Router();
const privacyScoreService = new PrivacyScoreService();

/**
 * POST /v1/privacy-score
 * Calculate comprehensive privacy score
 */
router.post('/privacy-score', async (req, res) => {
  try {
    const { ipLeak, dnsLeak, webrtcLeak } = req.body;

    // Calculate privacy score
    const result = await privacyScoreService.calculate({
      ipLeak,
      dnsLeak,
      webrtcLeak,
    });

    const response: APIResponse<PrivacyScore> = {
      success: true,
      data: result,
    };

    res.json(response);

    telemetryService
      .capture({
        type: 'privacy-score',
        source: 'privacy-service',
        severity: result.riskLevel,
        summary: `Score ${result.totalScore}/100`,
        payload: result,
        snapshot: {
          privacyScore: result.totalScore,
          entropyScore: result.breakdown.fingerprintResistance,
          leaks: {
            webrtc: Boolean(webrtcLeak?.isLeak),
            dns: dnsLeak?.leakType || 'none',
            battery: false,
            motion: false,
          },
          apiSurface: {
            ip: ipLeak?.ip || 'unknown',
          },
          report: telemetryService.buildReportSnapshot({
            privacyIndex: {
              score: result.totalScore,
              exposureLevel: result.riskLevel,
              leakedBits: result.breakdown.webrtcPrivacy + result.breakdown.dnsPrivacy,
            },
            networkLeaks: {
              ip: ipLeak?.ip,
              dns: dnsLeak?.leakType,
              webrtc: webrtcLeak?.isLeak ? 'leak' : 'sealed',
            },
          }),
        },
      })
      .catch((error) => console.warn('Telemetry capture failed (privacy score):', error));
  } catch (error: any) {
    console.error('Privacy score calculation error:', error);

    const response: APIResponse = {
      success: false,
      error: {
        code: 'PRIVACY_SCORE_ERROR',
        message: error.message || 'Failed to calculate privacy score',
      },
    };

    res.status(500).json(response);
  }
});

export default router;
