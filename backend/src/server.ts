import app from './app';
import { ENV } from './config/env';
import { prisma } from './prisma/client';

const server = app.listen(ENV.PORT, () => {
  console.info(`================================================`);
  console.info(`  RETINASCOPE BACKEND SERVER RUNNING`);
  console.info(`  Port:        ${ENV.PORT}`);
  console.info(`  Environment: ${ENV.NODE_ENV}`);
  console.info(`  Health:      http://localhost:${ENV.PORT}/api/health`);
  console.info(`  Frontend:    ${ENV.FRONTEND_URL}`);
  console.info(`================================================`);
});

const gracefulShutdown = async (signal: string) => {
  console.info(`\n[${signal}] Initiating graceful shutdown...`);
  server.close(async () => {
    try {
      await prisma.$disconnect();
      console.info('Database connection closed cleanly.');
      process.exit(0);
    } catch (err) {
      console.error('Error during database disconnect:', err);
      process.exit(1);
    }
  });

  // Force close if taking too long
  setTimeout(() => {
    console.error('Forced shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
