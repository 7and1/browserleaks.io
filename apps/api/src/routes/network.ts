import { Router } from 'express';
import { NetworkInsightsService } from '../services/NetworkInsightsService';
import type { APIResponse } from '@browserleaks/types';

const router = Router();
const networkInsightsService = new NetworkInsightsService();

router.get('/network/insights', async (_req, res) => {
  try {
    const data = await networkInsightsService.getInsights();

    const response: APIResponse<typeof data> = {
      success: true,
      data,
    };

    res.json(response);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'NETWORK_INSIGHTS_ERROR',
        message: error.message || 'Failed to load network insights',
      },
    });
  }
});

export default router;
