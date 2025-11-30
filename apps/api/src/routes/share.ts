/**
 * Share Link Routes
 *
 * Endpoints for creating and accessing shared scan reports.
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createHash } from 'crypto';
import { validate } from '../middleware/validate';

const router = Router();

// In-memory storage for demo (would use database in production)
const shareLinks = new Map<string, {
  code: string;
  scan: any;
  createdAt: Date;
  expiresAt: Date | null;
  viewCount: number;
  maxViews: number | null;
}>();

// Validation schemas
const createShareSchema = z.object({
  scan: z.object({
    id: z.string(),
    timestamp: z.string(),
    privacyScore: z.object({
      total: z.number(),
      riskLevel: z.string(),
      breakdown: z.object({
        ipPrivacy: z.number(),
        dnsPrivacy: z.number(),
        webrtcPrivacy: z.number(),
        fingerprintResistance: z.number(),
        browserConfig: z.number(),
      }),
    }),
    fingerprint: z.object({
      combinedHash: z.string(),
      uniquenessScore: z.number(),
    }).optional(),
    ip: z.object({
      address: z.string().optional(),
      country: z.string().optional(),
      city: z.string().optional(),
      privacy: z.object({
        isVpn: z.boolean().optional(),
        isProxy: z.boolean().optional(),
        isTor: z.boolean().optional(),
      }).optional(),
    }).optional(),
    dns: z.object({
      isLeak: z.boolean(),
      leakType: z.string(),
    }).optional(),
    webrtc: z.object({
      isLeak: z.boolean(),
    }).optional(),
    recommendations: z.array(z.string()).optional(),
  }),
  options: z.object({
    expiresIn: z.number().min(3600).max(2592000).optional(), // 1 hour to 30 days
    maxViews: z.number().min(1).max(1000).optional(),
    hideIP: z.boolean().optional(),
  }).optional(),
});

/**
 * POST /v1/share
 * Create a share link for a scan
 */
router.post('/', validate(createShareSchema), async (req: Request, res: Response) => {
  try {
    const { scan, options } = req.body;

    // Generate unique share code
    const code = generateShareCode();

    // Process scan data for sharing (optionally hide sensitive info)
    const shareScan = prepareScanForSharing(scan, options?.hideIP);

    // Calculate expiration
    const expiresAt = options?.expiresIn
      ? new Date(Date.now() + options.expiresIn * 1000)
      : null;

    // Store share link
    shareLinks.set(code, {
      code,
      scan: shareScan,
      createdAt: new Date(),
      expiresAt,
      viewCount: 0,
      maxViews: options?.maxViews || null,
    });

    // Generate share URL
    const shareUrl = `${process.env.FRONTEND_URL || 'https://browserleaks.io'}/share/${code}`;

    res.json({
      success: true,
      data: {
        code,
        url: shareUrl,
        expiresAt: expiresAt?.toISOString() || null,
        maxViews: options?.maxViews || null,
      },
    });

  } catch (error: any) {
    console.error('Share link creation error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHARE_CREATE_ERROR',
        message: error.message || 'Failed to create share link',
      },
    });
  }
});

/**
 * GET /v1/share/:code
 * Get shared scan by code
 */
router.get('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const shareData = shareLinks.get(code);

    if (!shareData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHARE_NOT_FOUND',
          message: 'Share link not found or has been deleted',
        },
      });
    }

    // Check expiration
    if (shareData.expiresAt && shareData.expiresAt < new Date()) {
      shareLinks.delete(code);
      return res.status(410).json({
        success: false,
        error: {
          code: 'SHARE_EXPIRED',
          message: 'This share link has expired',
        },
      });
    }

    // Check max views
    if (shareData.maxViews && shareData.viewCount >= shareData.maxViews) {
      return res.status(410).json({
        success: false,
        error: {
          code: 'SHARE_MAX_VIEWS',
          message: 'This share link has reached its maximum number of views',
        },
      });
    }

    // Increment view count
    shareData.viewCount++;

    res.json({
      success: true,
      data: {
        scan: shareData.scan,
        createdAt: shareData.createdAt.toISOString(),
        viewCount: shareData.viewCount,
        remainingViews: shareData.maxViews ? shareData.maxViews - shareData.viewCount : null,
        expiresAt: shareData.expiresAt?.toISOString() || null,
      },
    });

  } catch (error: any) {
    console.error('Share fetch error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHARE_FETCH_ERROR',
        message: error.message || 'Failed to fetch shared scan',
      },
    });
  }
});

/**
 * DELETE /v1/share/:code
 * Delete a share link
 */
router.delete('/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    if (!shareLinks.has(code)) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHARE_NOT_FOUND',
          message: 'Share link not found',
        },
      });
    }

    shareLinks.delete(code);

    res.json({
      success: true,
      data: {
        message: 'Share link deleted',
      },
    });

  } catch (error: any) {
    console.error('Share delete error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHARE_DELETE_ERROR',
        message: error.message || 'Failed to delete share link',
      },
    });
  }
});

/**
 * GET /v1/share/:code/stats
 * Get share link statistics
 */
router.get('/:code/stats', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;

    const shareData = shareLinks.get(code);

    if (!shareData) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SHARE_NOT_FOUND',
          message: 'Share link not found',
        },
      });
    }

    res.json({
      success: true,
      data: {
        code,
        createdAt: shareData.createdAt.toISOString(),
        expiresAt: shareData.expiresAt?.toISOString() || null,
        viewCount: shareData.viewCount,
        maxViews: shareData.maxViews,
        isExpired: shareData.expiresAt ? shareData.expiresAt < new Date() : false,
        isMaxViews: shareData.maxViews ? shareData.viewCount >= shareData.maxViews : false,
      },
    });

  } catch (error: any) {
    console.error('Share stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'SHARE_STATS_ERROR',
        message: error.message || 'Failed to get share statistics',
      },
    });
  }
});

// Helper functions

function generateShareCode(): string {
  // Generate a URL-safe, unique code
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${random}`;
}

function prepareScanForSharing(scan: any, hideIP: boolean = false): any {
  const shareScan = { ...scan };

  // Hide sensitive IP information if requested
  if (hideIP && shareScan.ip) {
    shareScan.ip = {
      ...shareScan.ip,
      address: maskIP(shareScan.ip.address),
    };
  }

  // Add share metadata
  shareScan.shared = {
    createdAt: new Date().toISOString(),
    isShared: true,
  };

  return shareScan;
}

function maskIP(ip: string): string {
  if (!ip) return 'hidden';

  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.*.*`;
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return `${parts[0]}:${parts[1]}:****:****`;
  }

  return 'hidden';
}

export default router;
