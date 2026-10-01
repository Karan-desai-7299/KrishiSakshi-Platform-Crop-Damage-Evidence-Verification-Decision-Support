import express from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', authController.demoLogin);
router.get('/me', requireAuth, authController.getMe);
router.get('/farmer/reports', requireAuth, authController.getFarmerReports);

export default router;
