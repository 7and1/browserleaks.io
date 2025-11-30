import { Router } from 'express';
import { telemetryService } from '../services/TelemetryService';

const router = Router();

router.get('/events/stream', async (req, res) => {
  await telemetryService.seed(res);
  telemetryService.stream(req, res);
});

export default router;
