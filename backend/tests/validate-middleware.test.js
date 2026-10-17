import Joi from 'joi';
import { describe, expect, it, vi } from 'vitest';
import { validate } from '../src/middleware/validate.js';

describe('query validation middleware', () => {
  it('stores normalized query values without assigning to Express request.query', () => {
    const req = {};
    Object.defineProperty(req, 'query', {
      configurable: true,
      get: () => ({ page: '2' }),
    });
    const next = vi.fn();
    const middleware = validate(Joi.object({ page: Joi.number().default(1) }), 'query');

    middleware(req, {}, next);

    expect(req.validatedQuery).toEqual({ page: 2 });
    expect(next).toHaveBeenCalledOnce();
    expect(next).toHaveBeenCalledWith();
  });
});
