import { Router } from 'express';
import { IPService } from '../services/IPService';
import type { APIResponse, IPLeakResult } from '@browserleaks/types';
import { telemetryService } from '../services/TelemetryService';

const router = Router();
const ipService = new IPService();

/**
 * POST /v1/detect/ip
 * Detect IP information
 */
router.post('/detect/ip', async (req, res) => {
  try {
    const { ip } = req.body;

    // If no IP provided, detect client IP
    const targetIP = ip || ipService.getClientIP(req);

    // Detect IP information
    const result = await ipService.detect(targetIP);

    const response: APIResponse<IPLeakResult> = {
      success: true,
      data: result,
    };

    res.json(response);

    telemetryService
      .capture({
        type: 'ip-detect',
        source: 'ip-service',
        severity: result.privacy.isProxy || result.privacy.isDatacenter ? 'medium' : 'low',
        summary: `${result.ip} · ${result.geo.countryCode}`,
        payload: result,
        snapshot: {
          privacyScore: Math.max(0, 100 - result.reputation.score),
          entropyScore: result.reputation.score,
          leaks: {
            webrtc: false,
            dns: 'none',
            battery: false,
            motion: false,
          },
          apiSurface: {
            isp: result.network.isp,
            asn: result.network.asn,
          },
          report: telemetryService.buildReportSnapshot({
            meta: { scanId: `ip-${result.ip}`, time: Date.now() },
            privacyIndex: {
              score: Math.max(0, 100 - result.reputation.score),
              exposureLevel: result.privacy.isProxy ? 'medium' : 'low',
              leakedBits: result.privacy.isProxy ? 32 : 8,
            },
            networkLeaks: {
              ip: result.ip,
            },
          }),
        },
      })
      .catch((error) => {
        console.warn('Telemetry capture failed (ip):', error);
      });
  } catch (error: any) {
    console.error('IP detection error:', error);

    const response: APIResponse = {
      success: false,
      error: {
        code: 'IP_DETECTION_ERROR',
        message: error.message || 'Failed to detect IP',
      },
    };

    res.status(500).json(response);
  }
});

/**
 * GET /v1/detect/ip/:ip
 * Detect specific IP information
 */
router.get('/detect/ip/:ip', async (req, res) => {
  try {
    const { ip } = req.params;

    // Detect IP information
    const result = await ipService.detect(ip);

    const response: APIResponse<IPLeakResult> = {
      success: true,
      data: result,
    };

    res.json(response);

    telemetryService
      .capture({
        type: 'ip-detect',
        source: 'ip-service',
        severity: result.privacy.isProxy || result.privacy.isDatacenter ? 'medium' : 'low',
        summary: `${result.ip} · ${result.geo.countryCode}`,
        payload: result,
        snapshot: {
          privacyScore: Math.max(0, 100 - result.reputation.score),
          entropyScore: result.reputation.score,
          leaks: {
            webrtc: false,
            dns: 'none',
            battery: false,
            motion: false,
          },
          apiSurface: {
            isp: result.network.isp,
            asn: result.network.asn,
          },
          report: telemetryService.buildReportSnapshot({
            meta: { scanId: `ip-${result.ip}`, time: Date.now() },
            privacyIndex: {
              score: Math.max(0, 100 - result.reputation.score),
              exposureLevel: result.privacy.isProxy ? 'medium' : 'low',
              leakedBits: result.privacy.isProxy ? 32 : 8,
            },
            networkLeaks: {
              ip: result.ip,
            },
          }),
        },
      })
      .catch((error) => {
        console.warn('Telemetry capture failed (ip-get):', error);
      });
  } catch (error: any) {
    console.error('IP detection error:', error);

    const response: APIResponse = {
      success: false,
      error: {
        code: 'IP_DETECTION_ERROR',
        message: error.message || 'Failed to detect IP',
      },
    };

    res.status(500).json(response);
  }
});

export default router;
