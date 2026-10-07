import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticate } from '../../auth/authenticate.js';
import * as controller from '../controllers/notification.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', asyncHandler(controller.list));
router.post('/:id/read', asyncHandler(controller.markRead));
export default router;
