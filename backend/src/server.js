import http from 'node:http';
import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import prisma from './database/prisma.js';

const server = http.createServer(app);

server.listen(env.port, () => {
  logger.info(`FreshCuts API listening on http://localhost:${env.port}`);
});

async function shutdown(signal) {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));