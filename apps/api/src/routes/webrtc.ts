import { Router } from 'express';
import { WebRTCLeakService } from '../services/WebRTCLeakService';
import { IPService } from '../services/IPService';
import type { APIResponse, WebRTCLeakResult, WebRTCLeakRequest } from '@browserleaks/types';
import { telemetryService } from '../services/TelemetryService';

const router = Router();
const webrtcService = new WebRTCLeakService();
const ipService = new IPService();

/**
 * POST /v1/detect/webrtc-leak
 * Analyze WebRTC leak test results
 */
router.post('/detect/webrtc-leak', async (req, res) => {
  try {
    const { publicIp, localIPs, candidates }: WebRTCLeakRequest = req.body;

    // If publicIp not provided, get client IP
    const targetIP = publicIp || ipService.getClientIP(req);

    // Analyze WebRTC leak
    const result = await webrtcService.analyze(targetIP, localIPs || [], candidates || []);

    const response: APIResponse<WebRTCLeakResult> = {
      success: true,
      data: result,
    };

    res.json(response);

    const severity = result.isLeak ? 'high' : 'low';
    const penalty = result.isLeak ? 55 : 10;

    telemetryService
      .capture({
        type: 'webrtc-leak',
        source: 'webrtc-service',
        severity,
        summary: result.isLeak
          ? `Leak via ${result.localIPs[0] || 'local interface'}`
          : 'No local leak detected',
        payload: result,
        snapshot: {
          privacyScore: Math.max(0, 100 - penalty),
          entropyScore: result.stunResults.length * 12,
          leaks: {
            webrtc: result.isLeak,
            dns: 'none',
            battery: false,
            motion: false,
          },
          apiSurface: {
            WebRTC: result.isLeak ? 'leaking' : 'sealed',
          },
          report: telemetryService.buildReportSnapshot({
            meta: { scanId: `webrtc-${targetIP}`, time: Date.now() },
            privacyIndex: {
              score: Math.max(0, 100 - penalty),
              exposureLevel: severity,
              leakedBits: result.isLeak ? 64 : 4,
            },
            networkLeaks: {
              webrtc: result.isLeak ? result.localIPs.join(', ') : 'sealed',
              ip: targetIP,
            },
          }),
        },
      })
      .catch((error) => {
        console.warn('Telemetry capture failed (webrtc):', error);
      });
  } catch (error: any) {
    console.error('WebRTC leak detection error:', error);

    const response: APIResponse = {
      success: false,
      error: {
        code: 'WEBRTC_LEAK_DETECTION_ERROR',
        message: error.message || 'Failed to analyze WebRTC leak',
      },
    };

    res.status(500).json(response);
  }
});

export default router;
