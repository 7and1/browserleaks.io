/**
 * History Routes
 *
 * Endpoints for scan history and comparison features.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const getHistorySchema = z.object({
  visitorId: z.string().min(16).max(64),
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

const compareSchema = z.object({
  scanIds: z.array(z.string()).min(2).max(5),
});

// In-memory storage for demo (would use database in production)
const scanHistory = new Map<string, any[]>();

/**
 * GET /v1/history
 * Get scan history for a visitor
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { visitorId, limit, offset } = getHistorySchema.parse(req.query);

    // Get history from storage
    const history = scanHistory.get(visitorId) || [];

    // Apply pagination
    const paginatedHistory = history
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(offset, offset + limit);

    res.json({
      success: true,
      data: {
        scans: paginatedHistory,
        pagination: {
          total: history.length,
          limit,
          offset,
          hasMore: offset + limit < history.length,
        },
      },
    });

  } catch (error: any) {
    console.error('History fetch error:', error);
    res.status(400).json({
      success: false,
      error: {
        code: 'HISTORY_FETCH_ERROR',
        message: error.message || 'Failed to fetch history',
      },
    });
  }
});

/**
 * POST /v1/history
 * Save a scan to history
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { visitorId, scan } = req.body;

    if (!visitorId || !scan) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'visitorId and scan are required',
        },
      });
    }

    // Get or create history for visitor
    if (!scanHistory.has(visitorId)) {
      scanHistory.set(visitorId, []);
    }

    const history = scanHistory.get(visitorId)!;

    // Add scan to history
    const scanRecord = {
      id: `scan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...scan,
    };

    history.unshift(scanRecord);

    // Keep only last 100 scans per visitor
    if (history.length > 100) {
      history.splice(100);
    }

    res.json({
      success: true,
      data: {
        scanId: scanRecord.id,
        message: 'Scan saved to history',
      },
    });

  } catch (error: any) {
    console.error('History save error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_SAVE_ERROR',
        message: error.message || 'Failed to save to history',
      },
    });
  }
});

/**
 * POST /v1/history/compare
 * Compare multiple scans
 */
router.post('/compare', validate(compareSchema), async (req: Request, res: Response) => {
  try {
    const { scanIds } = req.body;

    // Find scans by ID
    const scansToCompare: any[] = [];

    for (const [, history] of scanHistory) {
      for (const scan of history) {
        if (scanIds.includes(scan.id)) {
          scansToCompare.push(scan);
        }
      }
    }

    if (scansToCompare.length < 2) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCANS_NOT_FOUND',
          message: 'Could not find enough scans to compare',
        },
      });
    }

    // Generate comparison
    const comparison = generateComparison(scansToCompare);

    res.json({
      success: true,
      data: comparison,
    });

  } catch (error: any) {
    console.error('Comparison error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'COMPARISON_ERROR',
        message: error.message || 'Failed to compare scans',
      },
    });
  }
});

/**
 * GET /v1/history/:scanId
 * Get a specific scan by ID
 */
router.get('/:scanId', async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;

    // Find scan by ID
    let foundScan = null;

    for (const [, history] of scanHistory) {
      const scan = history.find(s => s.id === scanId);
      if (scan) {
        foundScan = scan;
        break;
      }
    }

    if (!foundScan) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    res.json({
      success: true,
      data: foundScan,
    });

  } catch (error: any) {
    console.error('Scan fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_FETCH_ERROR',
        message: error.message || 'Failed to fetch scan',
      },
    });
  }
});

/**
 * DELETE /v1/history/:scanId
 * Delete a scan from history
 */
router.delete('/:scanId', async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;
    const { visitorId } = req.query;

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'visitorId is required',
        },
      });
    }

    const history = scanHistory.get(visitorId as string);
    if (!history) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'HISTORY_NOT_FOUND',
          message: 'No history found for this visitor',
        },
      });
    }

    const index = history.findIndex(s => s.id === scanId);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SCAN_NOT_FOUND',
          message: 'Scan not found',
        },
      });
    }

    history.splice(index, 1);

    res.json({
      success: true,
      data: {
        message: 'Scan deleted from history',
      },
    });

  } catch (error: any) {
    console.error('Scan delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SCAN_DELETE_ERROR',
        message: error.message || 'Failed to delete scan',
      },
    });
  }
});

/**
 * DELETE /v1/history
 * Clear all history for a visitor
 */
router.delete('/', async (req: Request, res: Response) => {
  try {
    const { visitorId } = req.query;

    if (!visitorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'visitorId is required',
        },
      });
    }

    scanHistory.delete(visitorId as string);

    res.json({
      success: true,
      data: {
        message: 'History cleared',
      },
    });

  } catch (error: any) {
    console.error('History clear error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_CLEAR_ERROR',
        message: error.message || 'Failed to clear history',
      },
    });
  }
});

// Helper functions

function generateComparison(scans: any[]) {
  // Sort by timestamp
  const sortedScans = [...scans].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const comparison: any = {
    scans: sortedScans.map(scan => ({
      id: scan.id,
      timestamp: scan.timestamp,
      privacyScore: scan.privacyScore?.total,
      riskLevel: scan.privacyScore?.riskLevel,
    })),
    changes: [],
    trends: {},
  };

  // Compare privacy scores
  if (sortedScans.length >= 2) {
    const first = sortedScans[0];
    const last = sortedScans[sortedScans.length - 1];

    const scoreDiff = (last.privacyScore?.total || 0) - (first.privacyScore?.total || 0);

    comparison.trends.privacyScore = {
      direction: scoreDiff > 0 ? 'improved' : scoreDiff < 0 ? 'declined' : 'stable',
      change: scoreDiff,
      firstScore: first.privacyScore?.total || 0,
      lastScore: last.privacyScore?.total || 0,
    };

    // Detect specific changes
    const changes: string[] = [];

    // IP changes
    if (first.ip?.address !== last.ip?.address) {
      changes.push(`IP changed from ${first.ip?.address || 'unknown'} to ${last.ip?.address || 'unknown'}`);
    }

    // VPN status changes
    if (first.ip?.privacy?.isVpn !== last.ip?.privacy?.isVpn) {
      if (last.ip?.privacy?.isVpn) {
        changes.push('VPN enabled');
      } else {
        changes.push('VPN disabled');
      }
    }

    // Fingerprint uniqueness changes
    const firstUniqueness = first.fingerprint?.uniquenessScore || 0;
    const lastUniqueness = last.fingerprint?.uniquenessScore || 0;
    const uniquenessDiff = lastUniqueness - firstUniqueness;

    if (Math.abs(uniquenessDiff) > 0.1) {
      if (uniquenessDiff > 0) {
        changes.push(`Fingerprint uniqueness increased by ${Math.round(uniquenessDiff * 100)}%`);
      } else {
        changes.push(`Fingerprint uniqueness decreased by ${Math.round(Math.abs(uniquenessDiff) * 100)}%`);
      }
    }

    // DNS leak changes
    if (first.dns?.isLeak !== last.dns?.isLeak) {
      if (last.dns?.isLeak) {
        changes.push('DNS leak detected');
      } else {
        changes.push('DNS leak fixed');
      }
    }

    // WebRTC leak changes
    if (first.webrtc?.isLeak !== last.webrtc?.isLeak) {
      if (last.webrtc?.isLeak) {
        changes.push('WebRTC leak detected');
      } else {
        changes.push('WebRTC leak fixed');
      }
    }

    comparison.changes = changes;
  }

  return comparison;
}

export default router;
