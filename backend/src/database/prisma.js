import { PrismaClient } from '@prisma/client';
import env from '../config/env.js';

const prisma = new PrismaClient({
  log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
});

export default prisma;