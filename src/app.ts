import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { Prisma } from '@prisma/client';

import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';

// Modules
import memberRoutes from '@/modules/member/member.router';
import subscriptionRoutes from '@/modules/subscription/subscription.router';
import paymentRoutes from '@/modules/subscription/payment.router';
import appointmentRoutes from '@/modules/appointment/appointment.router';
import attendanceRoutes from '@/modules/attendance/attendance.router';
import staffRoutes from '@/modules/staff/staff.router';
import productRoutes from '@/modules/product/product.router';
import workoutRoutes from '@/modules/workout/workout.router';
import interactionRoutes from '@/modules/interaction/interaction.router';
import measurementRoutes from '@/modules/measurement/measurement.router';
import goalRoutes from '@/modules/goal/goal.router';
import notificationRoutes from '@/modules/notification/notification.router';
import payrollRoutes from '@/modules/payroll/payroll.router';
import authRoutes from '@/modules/auth/auth.router';
import authPlugin from '@/lib/auth.plugin';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: logger as any,
  });

  // ── Global Plugins ──────────────────────────────────────────
  await app.register(helmet);
  
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN || '*',
  });

  await app.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
  });

  await app.register(swagger, {
    swagger: {
      info: {
        title: 'AwareFit CRM API',
        description: 'Enterprise Fitness CRM API Documentation',
        version: '1.0.0',
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // ── Health Check ───────────────────────────────────────────
  app.get('/health', async () => ({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
  }));

  // ── Global Error Handler ───────────────────────────────────
  app.setErrorHandler((error: Error, request: FastifyRequest, reply: FastifyReply) => {
    // 1. Known AppError (from our service layer)
    if (error instanceof AppError) {
      app.log.warn({ err: error, reqId: request.id }, 'AppError occurred');
      return reply.status(error.statusCode).send({
        error: error.name,
        code: error.code,
        message: error.message,
      });
    }

    // 2. Validation Errors (Zod)
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: 'ValidationError',
        message: 'Invalid input',
        details: error.issues,
      });
    }

    // 3. Prisma Database Errors
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return reply.status(409).send({
          error: 'ConflictError',
          message: 'Unique constraint failed on the database',
          details: error.meta,
        });
      }
      if (error.code === 'P2025') {
        return reply.status(404).send({
          error: 'NotFoundError',
          message: 'Record to update/delete was not found',
        });
      }
    }

    // 4. Default Fastify Error (e.g. 404 from missing route)
    // @ts-ignore
    if (error.statusCode) {
      // @ts-ignore
      return reply.status(error.statusCode).send(error);
    }

    // 5. Unknown 500 error fallback
    app.log.error({ err: error, reqId: request.id }, 'Unhandled Exception');
    reply.status(500).send({
      error: 'InternalServerError',
      message: 'An unexpected error occurred',
    });
  });

  // ── Routes ──────────────────────────────────────────────────
  // Global Custom JWT Authentication Mapping
  await app.register(authPlugin);

  // 4. Router Register
  await app.register(authRoutes, { prefix: '/api/v1/auth' });
  await app.register(memberRoutes, { prefix: '/api/v1' });
  await app.register(subscriptionRoutes, { prefix: '/api/v1' });
  await app.register(paymentRoutes, { prefix: '/api/v1' });
  await app.register(appointmentRoutes, { prefix: '/api/v1' });
  await app.register(attendanceRoutes, { prefix: '/api/v1' });
  await app.register(staffRoutes, { prefix: '/api/v1' });
  await app.register(productRoutes, { prefix: '/api/v1' });
  await app.register(workoutRoutes, { prefix: '/api/v1' });
  await app.register(interactionRoutes, { prefix: '/api/v1' });
  await app.register(measurementRoutes, { prefix: '/api/v1' });
  await app.register(goalRoutes, { prefix: '/api/v1' });
  await app.register(notificationRoutes, { prefix: '/api/v1' });
  await app.register(payrollRoutes, { prefix: '/api/v1' });

  return app;
}
