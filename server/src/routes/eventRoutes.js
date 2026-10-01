import express from 'express';
import { eventController } from '../controllers/eventController.js';

const router = express.Router();

router.get('/', eventController.listEvents);
router.post('/analyze', eventController.analyze);
router.post('/peak-window', eventController.peakWindow);
router.post('/', eventController.createEvent);
router.post('/:id/alert', eventController.sendAlert);

export default router;
