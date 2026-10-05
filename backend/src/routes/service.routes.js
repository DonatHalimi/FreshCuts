import { Router } from 'express';
import * as controller from '../controllers/service.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();
router.get('/', asyncHandler(controller.listServices));

export default router;