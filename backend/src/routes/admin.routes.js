import { Router } from 'express';
import { authenticate } from '../auth/authenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validate } from '../middleware/validate.js';
import { idSchema } from '../validations/appointment.validation.js';
import {
  adminAppointmentsQuerySchema,
  bulkDeleteSchema,
  createUserSchema,
  createProviderSchema,
  createServiceSchema,
  updateAppointmentStatusSchema,
  updateProviderSchema,
  updateServiceSchema,
  updateUserSchema,
} from '../validations/admin.validation.js';
import * as controller from '../controllers/admin.controller.js';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));
router.get('/dashboard', asyncHandler(controller.dashboard));
router.get('/appointments', validate(adminAppointmentsQuerySchema, 'query'), asyncHandler(controller.appointments));
router.delete('/appointments/bulk-delete', validate(bulkDeleteSchema), asyncHandler(controller.bulkDeleteAppointments));
router.delete('/appointments/:id', validate(idSchema, 'params'), asyncHandler(controller.deleteAppointment));
router.patch('/appointments/:id/status', validate(idSchema, 'params'), validate(updateAppointmentStatusSchema), asyncHandler(controller.updateAppointmentStatus));
router.get('/users', asyncHandler(controller.users));
router.post('/users', validate(createUserSchema), asyncHandler(controller.createUser));
router.delete('/users/bulk-delete', validate(bulkDeleteSchema), asyncHandler(controller.bulkDeleteUsers));
router.delete('/users/:id', validate(idSchema, 'params'), asyncHandler(controller.deleteUser));
router.patch('/users/:id', validate(updateUserSchema), asyncHandler(controller.updateUser));
router.get('/services', asyncHandler(controller.services));
router.delete('/services/bulk-delete', validate(bulkDeleteSchema), asyncHandler(controller.bulkDeleteServices));
router.delete('/services/:id', validate(idSchema, 'params'), asyncHandler(controller.deleteService));
router.post('/services', validate(createServiceSchema), asyncHandler(controller.createService));
router.patch('/services/:id', validate(updateServiceSchema), asyncHandler(controller.updateService));
router.get('/providers', asyncHandler(controller.providers));
router.delete('/providers/bulk-delete', validate(bulkDeleteSchema), asyncHandler(controller.bulkDeleteProviders));
router.delete('/providers/:id', validate(idSchema, 'params'), asyncHandler(controller.deleteProvider));
router.post('/providers', validate(createProviderSchema), asyncHandler(controller.createProvider));
router.patch('/providers/:id', validate(idSchema, 'params'), validate(updateProviderSchema), asyncHandler(controller.updateProvider));
export default router;
