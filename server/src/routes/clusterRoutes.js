import express from 'express';
import { clusterController } from '../controllers/clusterController.js';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate', requireAuth, clusterController.generate);
router.get('/stats/summary', optionalAuth, clusterController.getStats);
router.get('/', optionalAuth, clusterController.listClusters);
router.get('/:id', optionalAuth, clusterController.getCluster);

export default router;
