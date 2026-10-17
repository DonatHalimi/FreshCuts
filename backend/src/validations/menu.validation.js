import Joi from 'joi';
import { URL } from 'node:url';

const uuid = Joi.string().guid({ version: ['uuidv4', 'uuidv5'] });
const key = Joi.string().trim().lowercase().pattern(/^[a-z0-9][a-z0-9_-]{0,99}$/);
const permissions = Joi.array().items(Joi.string().trim().pattern(/^[a-z][a-z0-9]*(\.[a-z][a-z0-9]*)+$/)).unique().max(20);
const href = Joi.string().trim().max(500).allow(null, '').custom((value, helpers) => {
  if (!value) return value;
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return value;
  try {
    const url = new URL(value);
    if (url.protocol === 'https:') return value;
  } catch {
    return helpers.error('string.uri');
  }
  return helpers.error('string.uri');
}, 'safe navigation URL');

export const menuKeySchema = Joi.object({
  key: Joi.string().trim().lowercase().pattern(/^[a-z0-9][a-z0-9_-]{0,79}$/).required(),
});

const menuItemFields = {
  key: key.required(),
  parentId: uuid.allow(null).default(null),
  label: Joi.string().trim().min(1).max(120).required(),
  href: href.default(null),
  iconKey: Joi.string().trim().max(60).allow(null, '').default(null),
  requiredPermissions: permissions.default([]),
  position: Joi.number().integer().min(0).max(10000).default(0),
  isActive: Joi.boolean().default(true),
  openInNewTab: Joi.boolean().default(false),
};

export const createMenuItemSchema = Joi.object(menuItemFields);

export const updateMenuItemSchema = Joi.object({
  key: key.optional(),
  parentId: uuid.allow(null).optional(),
  label: Joi.string().trim().min(1).max(120),
  href: href.optional(),
  iconKey: Joi.string().trim().max(60).allow(null, ''),
  requiredPermissions: permissions,
  position: Joi.number().integer().min(0).max(10000),
  isActive: Joi.boolean(),
  openInNewTab: Joi.boolean(),
}).min(1);

export const menuItemParamsSchema = Joi.object({
  key: Joi.string().trim().lowercase().pattern(/^[a-z0-9][a-z0-9_-]{0,79}$/).required(),
  id: uuid.required(),
});

export const reorderMenuItemsSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    id: uuid.required(),
    parentId: uuid.allow(null).required(),
    position: Joi.number().integer().min(0).max(10000).required(),
  })).min(1).max(500).unique('id').required(),
});
