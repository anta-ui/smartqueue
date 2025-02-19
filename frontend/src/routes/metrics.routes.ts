// routes/metrics.routes.ts
import express from 'express';
import { 
  getMetrics, 
  getServiceStatus, 
  getAlerts, 
  getUsageData 
} from '../controllers/metrics.controller';

const router = express.Router();

router.get('/metrics', getMetrics);
router.get('/services/status', getServiceStatus);
router.get('/alerts', getAlerts);
router.get('/usage', getUsageData);

export default router;