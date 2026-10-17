import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate, validateHeader } from '../middleware/validate.js';
import { authenticate } from '../auth/authenticate.js';
import {
  appointmentListQuerySchema,
  cancelSchema,
  createAppointmentSchema,
  idempotencyKeySchema,
  idSchema,
  rescheduleSchema,
} from '../validations/appointment.validation.js';
import * as controller from '../controllers/appointment.controller.js';

const router = Router();
router.use(authenticate);
router.get('/', validate(appointmentListQuerySchema, 'query'), asyncHandler(controller.list));
router.post(
  '/',
  validateHeader(idempotencyKeySchema, 'Idempotency-Key'),
  validate(createAppointmentSchema),
  asyncHandler(controller.create),
);
router.get('/:id', validate(idSchema, 'params'), asyncHandler(controller.get));
router.post('/:id/cancel', validate(idSchema, 'params'), validate(cancelSchema), asyncHandler(controller.cancel));
router.post('/:id/reschedule', validate(idSchema, 'params'), validate(rescheduleSchema), asyncHandler(controller.reschedule));
export default router;
