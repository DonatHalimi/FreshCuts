import { Router } from 'express';
import * as controller from '../controllers/health.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(controller.health));

export default router;