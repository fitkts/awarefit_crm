import type { FastifyInstance } from 'fastify';
import { paymentService, RefundPaymentSchema, type RefundPaymentDto } from './payment.service';

// ============================================================
// Payment Router
// ============================================================
async function paymentRoutes(app: FastifyInstance) {
  // ----------------------------------------------------------
  // POST /payments/:id/refund — process partial or full refund
  // ----------------------------------------------------------
  app.post<{ Params: { id: string }; Body: RefundPaymentDto }>(
    '/payments/:id/refund',
    async (request, reply) => {
      const id = Number(request.params.id);
      const dto = RefundPaymentSchema.parse(request.body);
      const result = await paymentService.refund(id, dto);
      return reply.send(result);
    },
  );
}

export default paymentRoutes;
