import { Router } from 'express';
import * as controller from '../controllers/provider.controller.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { providerIdSchema, providerQuerySchema } from '../validations/provider.validation.js';

const router = Router();
router.get('/', validate(providerQuerySchema, 'query'), asyncHandler(controller.listProviders));
router.get('/:id', validate(providerIdSchema, 'params'), asyncHandler(controller.getProvider));

export default router;