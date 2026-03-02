import { Router } from 'express';
import { contactController } from './contact.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.post('/', contactController.create);

// Protected routes (Admin only)
router.use(authenticate);
router.get('/', contactController.getAll);
router.get('/:id', contactController.getById);
router.patch('/:id/status', contactController.updateStatus);
router.delete('/:id', contactController.delete);

export default router;
