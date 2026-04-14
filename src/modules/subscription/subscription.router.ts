import type { FastifyInstance } from 'fastify';
import { subscriptionService } from './subscription.service';
import {
  CreateSubscriptionSchema,
  PauseSubscriptionSchema,
  TransferSubscriptionSchema,
  type CreateSubscriptionDto,
  type PauseSubscriptionDto,
  type TransferSubscriptionDto,
} from './subscription.schema';
import { z } from 'zod';

// ============================================================
// Subscription Router
// ============================================================
async function subscriptionRoutes(app: FastifyInstance) {
  // ----------------------------------------------------------
  // GET /members/:memberId/subscriptions — findByMember
  // ----------------------------------------------------------
  app.get<{ Params: { memberId: string } }>(
    '/members/:memberId/subscriptions',
    async (request, reply) => {
      const memberId = Number(request.params.memberId);
      const result = await subscriptionService.findByMember(memberId);
      return reply.send(result);
    },
  );

  // ----------------------------------------------------------
  // GET /members/:memberId/subscriptions/active — findActive
  // ----------------------------------------------------------
  app.get<{ Params: { memberId: string } }>(
    '/members/:memberId/subscriptions/active',
    async (request, reply) => {
      const memberId = Number(request.params.memberId);
      const result = await subscriptionService.findActive(memberId);
      return reply.send(result);
    },
  );

  // ----------------------------------------------------------
  // POST /subscriptions — create
  // ----------------------------------------------------------
  app.post<{ Body: CreateSubscriptionDto }>('/subscriptions', async (request, reply) => {
    const dto = CreateSubscriptionSchema.parse(request.body);
    const result = await subscriptionService.create(dto);
    return reply.status(201).send(result);
  });

  // ----------------------------------------------------------
  // PATCH /subscriptions/:id/pause — pause
  // ----------------------------------------------------------
  app.patch<{ Params: { id: string }; Body: PauseSubscriptionDto }>(
    '/subscriptions/:id/pause',
    async (request, reply) => {
      const id = Number(request.params.id);
      const dto = PauseSubscriptionSchema.parse(request.body);
      const result = await subscriptionService.pause(id, dto);
      return reply.send(result);
    },
  );

  // ----------------------------------------------------------
  // PATCH /subscriptions/:id/cancel — cancel
  // ----------------------------------------------------------
  app.patch<{ Params: { id: string }; Body: { reason: string } }>(
    '/subscriptions/:id/cancel',
    async (request, reply) => {
      const id = Number(request.params.id);
      const bodySchema = z.object({ reason: z.string() });
      const { reason } = bodySchema.parse(request.body);
      const result = await subscriptionService.cancel(id, reason);
      return reply.send(result);
    },
  );

  // ----------------------------------------------------------
  // POST /subscriptions/:id/transfer — transfer
  // ----------------------------------------------------------
  app.post<{ Params: { id: string }; Body: TransferSubscriptionDto }>(
    '/subscriptions/:id/transfer',
    async (request, reply) => {
      const id = Number(request.params.id);
      const dto = TransferSubscriptionSchema.parse(request.body);
      const result = await subscriptionService.transfer(id, dto);
      return reply.status(201).send(result);
    },
  );
}

export default subscriptionRoutes;
