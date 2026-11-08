import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getAlerts, createAlert, resolveAlert } from '../controllers/alertController.js';

const router = Router();
router.use(protect);

router.get('/', getAlerts);
router.post('/', createAlert);
router.patch('/:id/resolve', resolveAlert);

export default router;
