import express from 'express';
import { reportController } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadPhoto } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/', requireAuth, uploadPhoto.single('photo'), reportController.createReport);
router.get('/:id/dossier', requireAuth, reportController.getCaseDossier);
router.post('/:id/verify', requireAuth, uploadPhoto.single('photo'), reportController.submitVerification);
router.get('/:id', requireAuth, reportController.getReportById);

export default router;
