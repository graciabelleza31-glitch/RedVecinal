import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
// AQUÍ AGREGAMOS getPublicProfile a la lista de importaciones
import { updateProfile, changePassword, getNeighbors, getPublicProfile } from '../controllers/userController.js';

const router = Router();
router.use(protect);

router.put('/me', updateProfile);
router.put('/me/password', changePassword);
router.get('/neighbors', getNeighbors);
router.get('/:id', getPublicProfile);

export default router;