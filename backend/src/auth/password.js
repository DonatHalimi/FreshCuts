import bcrypt from 'bcrypt';
import env from '../config/env.js';

export function hashPassword(password) {
  return bcrypt.hash(password, env.bcryptCost);
}

export function comparePassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}