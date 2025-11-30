import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '../../.env' });

// Environment schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.string().default('4000'),

  // API Keys
  IPINFO_TOKEN: z.string().optional(),
  CLOUDFLARE_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_RADAR_TOKEN: z.string().optional(),
  CLOUDFLARE_D1_DATABASE_ID: z.string().optional(),
  CLOUDFLARE_API_TOKEN: z.string().optional(),

  // Database
  DATABASE_URL: z.string().optional(),
  REDIS_URL: z.string().optional(),

  // Security
  JWT_SECRET: z.string().default('change-this-secret-in-production'),
  API_TOKEN_PREFIX: z.string().default('bl'),

  // Rate Limiting
  RATE_LIMIT_FREE: z.string().default('100'),
  RATE_LIMIT_FREE_PERIOD: z.string().default('86400'),

  // Cache
  CACHE_TTL_IP: z.string().default('300'),
  CACHE_TTL_FINGERPRINT: z.string().default('3600'),

  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),

  // Cloudflare Workers / D1
  CF_D1_ENDPOINT: z.string().optional(),
  CF_WORKER_DNS_BEACON_URL: z.string().optional(),
  CF_WORKER_JA3_URL: z.string().optional(),
});

// Parse and validate环境变量
const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error('❌ Invalid environment variables:');
    console.error(parsed.error.format());
    throw new Error('Invalid environment variables');
  }

  return parsed.data;
};

export const config = parseEnv();

// Helper function to check if required API keys are present
export const hasIPinfoToken = () => Boolean(config.IPINFO_TOKEN);
export const hasCloudflareRadarToken = () =>
  Boolean(config.CLOUDFLARE_ACCOUNT_ID && config.CLOUDFLARE_RADAR_TOKEN);

// Require at least one IP data provider
if (!hasIPinfoToken() && !hasCloudflareRadarToken()) {
  throw new Error(
    'At least one IP data provider is required: IPINFO_TOKEN or CLOUDFLARE_RADAR_TOKEN'
  );
}
