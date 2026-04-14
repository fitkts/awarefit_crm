import { buildApp } from '@/app';
import dotenv from 'dotenv';
import prisma from '@/lib/prisma';
import { setupInsightJobs } from '@/jobs/insight.job';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);

async function start() {
  const app = await buildApp();

  try {
    await prisma.$connect();
    app.log.info('Database connected successfully');

    setupInsightJobs(); // Instantiate Cron Schedules

    await app.listen({ port, host: '0.0.0.0' });
    app.log.info(`Server listening on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }

  const gracefulShutdown = async (signal: string) => {
    app.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      await prisma.$disconnect();
      app.log.info('Closed fastify and disconnected prisma.');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
}

start();
