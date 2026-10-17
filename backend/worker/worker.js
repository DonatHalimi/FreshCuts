import logger from '../src/config/logger.js';
import prisma from '../src/database/prisma.js';
import { processEmails } from './emailWorker.js';
import { cleanupExpiredData } from './cleanupWorker.js';

let running = true;

async function tick() {
  if (!running) return;
  try {
    await processEmails();
  } catch (error) {
    logger.error({ err: error }, 'Worker tick failed');
  }
}

await tick();
const interval = setInterval(tick, 5000);
const cleanup = setInterval(() => cleanupExpiredData().catch((error) => logger.error({ err: error }, 'Cleanup failed')), 24 * 60 * 60_000);

async function shutdown(signal) {
  running = false;
  clearInterval(interval);
  clearInterval(cleanup);
  await prisma.$disconnect();
  logger.info({ signal }, 'Worker stopped');
  process.exit(0);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
