import { Router } from 'express';
import { authenticate } from '../../auth/authenticate.js';
import { requireRole } from '../../middleware/requireRole.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as controller from './admin.controller.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));
router.get('/dashboard', asyncHandler(controller.dashboard));
router.get('/users', asyncHandler(controller.users));
router.patch('/users/:id', asyncHandler(controller.updateUser));
router.get('/services', asyncHandler(controller.services));
router.patch('/services/:id', asyncHandler(controller.updateService));
export default router;
