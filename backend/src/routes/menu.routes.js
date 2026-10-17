import { Router } from 'express';
import { authenticate } from '../auth/authenticate.js';
import { optionalAuthenticate } from '../auth/optionalAuthenticate.js';
import { requireRole } from '../middleware/requireRole.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as controller from '../controllers/menu.controller.js';
import {
  createMenuItemSchema,
  menuItemParamsSchema,
  menuKeySchema,
  reorderMenuItemsSchema,
  updateMenuItemSchema,
} from '../validations/menu.validation.js';

const router = Router();
const admin = [authenticate, requireRole('ADMIN')];

router.get('/admin', ...admin, asyncHandler(controller.listMenus));
router.post('/admin/:key/items', ...admin, validate(menuKeySchema, 'params'), validate(createMenuItemSchema), asyncHandler(controller.createItem));
router.patch('/admin/:key/items/reorder', ...admin, validate(menuKeySchema, 'params'), validate(reorderMenuItemsSchema), asyncHandler(controller.reorderItems));
router.patch('/admin/:key/items/:id', ...admin, validate(menuItemParamsSchema, 'params'), validate(updateMenuItemSchema), asyncHandler(controller.updateItem));
router.delete('/admin/:key/items/:id', ...admin, validate(menuItemParamsSchema, 'params'), asyncHandler(controller.deleteItem));
router.get('/:key', optionalAuthenticate, validate(menuKeySchema, 'params'), asyncHandler(controller.getMenu));

export default router;
