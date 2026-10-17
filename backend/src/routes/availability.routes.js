import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { availabilityQuerySchema } from '../validations/availability.validation.js';
import * as controller from '../controllers/availability.controller.js';

const router = Router();
router.get('/', validate(availabilityQuerySchema, 'query'), asyncHandler(controller.list));
export default router;
