import fp from 'fastify-plugin';
import { FastifyRequest, FastifyReply } from 'fastify';
import { AppError } from './errors';
import jwt from '@fastify/jwt';

// Declaring JWT payload types overriding default fastify typings natively
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: number; role: string; centerId: number };
    user: { id: number; role: string; centerId: number };
  }
}

// Ensure the fastify instance context is augmented
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export default fp(async (app) => {
  // We recommend using env variables for JWT_SECRET on production
  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'awarefit_super_secret_fallback_key',
  });

  // Global authentication verifying native headers tracking bounded contexts
  app.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      throw new AppError('UNAUTHORIZED', 401, '토큰이 없거나 유효하지 않습니다.');
    }
  });

  // High-order hook parsing explicit bounds mapping explicitly extracted RBAC logic
  app.decorate('requireRole', (roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      // Must execute authenticate hook primarily
      await app.authenticate(request, reply);
      
      const user = request.user;
      if (!user) {
        throw new AppError('UNAUTHORIZED', 401, '인증 정보가 명시되지 않았습니다.');
      }

      if (!roles.includes(user.role)) {
        throw new AppError('FORBIDDEN', 403, '이 작업을 수행할 권한(Role)이 없습니다.');
      }
    };
  });
});
