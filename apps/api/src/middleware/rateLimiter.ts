import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { config } from '../config';
import { logger } from './logger';

// Get client IP helper
function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  return req.socket?.remoteAddress || 'unknown';
}

// Rate limit response format
interface RateLimitResponse {
  success: false;
  error: {
    code: string;
    message: string;
    retryAfter: number;
    requestId?: string;
  };
}

// Standard rate limit handler
function rateLimitHandler(req: Request, res: Response): void {
  const retryAfter = Math.ceil((res.getHeader('Retry-After') as number) || 60);

  logger.warn('Rate limit exceeded', {
    requestId: req.requestId,
    ip: getClientIP(req),
    url: req.originalUrl,
    retryAfter,
  });

  const response: RateLimitResponse = {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
      retryAfter,
      requestId: req.requestId,
    },
  };

  res.status(429).json(response);
}

// Skip rate limiting for certain conditions
function shouldSkipRateLimit(req: Request): boolean {
  // Skip health checks
  if (req.path === '/health') {
    return true;
  }

  // Skip internal requests (for service-to-service communication)
  const internalToken = req.headers['x-internal-token'];
  if (internalToken === config.JWT_SECRET) {
    return true;
  }

  return false;
}

// Create standard rate limiter
export const standardLimiter = rateLimit({
  windowMs: parseInt(config.RATE_LIMIT_FREE_PERIOD) * 1000, // Default 24 hours
  max: parseInt(config.RATE_LIMIT_FREE), // Default 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  keyGenerator: getClientIP,
  handler: rateLimitHandler,
  message: 'Too many requests',
});

// Strict rate limiter for sensitive endpoints
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  keyGenerator: getClientIP,
  handler: rateLimitHandler,
  message: 'Too many requests to this endpoint',
});

// Burst limiter for high-frequency endpoints
export const burstLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 10, // 10 requests per second
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldSkipRateLimit,
  keyGenerator: getClientIP,
  handler: rateLimitHandler,
  message: 'Request rate too high',
});

// Create custom rate limiter with specific settings
export function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: shouldSkipRateLimit,
    keyGenerator: getClientIP,
    handler: rateLimitHandler,
    message: options.message || 'Too many requests',
  });
}

// Rate limiter configuration by tier
export const rateLimitTiers = {
  free: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100,
  },
  pro: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 10000,
  },
  enterprise: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 1000000,
  },
};

// Dynamic rate limiter based on API key tier
export function tierBasedLimiter(getTier: (req: Request) => 'free' | 'pro' | 'enterprise') {
  return (req: Request, res: Response, next: () => void): void => {
    const tier = getTier(req);
    const limits = rateLimitTiers[tier];

    const limiter = createRateLimiter(limits);
    limiter(req, res, next);
  };
}

export default {
  standardLimiter,
  strictLimiter,
  burstLimiter,
  createRateLimiter,
  tierBasedLimiter,
};
