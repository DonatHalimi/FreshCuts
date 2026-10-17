import { Router } from 'express';
import * as controller from '../controllers/auth.controller.js';
import * as passwordResetController from '../controllers/passwordReset.controller.js';
import { authLimiter, resendVerificationLimiter } from '../middleware/rateLimiters.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forgotPasswordSchema, resetPasswordSchema } from '../validations/passwordReset.validation.js';
import {
  loginSchema,
  registerSchema,
  resendVerificationSchema,
  verifyEmailSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), asyncHandler(controller.register));
router.post('/verify-email', authLimiter, validate(verifyEmailSchema), asyncHandler(controller.verifyEmail));
router.post('/resend-verification', resendVerificationLimiter, validate(resendVerificationSchema), asyncHandler(controller.resendVerification));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(controller.login));
router.post('/staff/login', authLimiter, validate(loginSchema), asyncHandler(controller.staffLogin));
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), asyncHandler(passwordResetController.forgotPassword));
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), asyncHandler(passwordResetController.resetPassword));
router.post('/refresh', asyncHandler(controller.refresh));
router.post('/logout', asyncHandler(controller.logout));

export default router;