import { Router } from 'express';
import { authenticate } from '../auth/authenticate.js';
import * as controller from '../controllers/user.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { updateProfileSchema } from '../validations/user.validation.js';

const router = Router();
router.use(authenticate);
router.get('/me', asyncHandler(controller.getMe));
router.patch('/me', validate(updateProfileSchema), asyncHandler(controller.updateMe));

export default router;