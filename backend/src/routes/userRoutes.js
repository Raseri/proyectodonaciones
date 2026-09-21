import { Router } from 'express';
import { getCurrentUser, getUsers, updateCurrentUser } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';

const router = Router();

router.get('/me', authenticateToken, getCurrentUser);
router.put('/me', authenticateToken, updateCurrentUser);
router.get('/', authenticateToken, requireRole('ADMIN'), getUsers);

export default router;
