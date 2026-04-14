import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

export const RefundPaymentSchema = z.object({
  amount: z.number().int().positive(),
  reason: z.string().optional(),
});

export type RefundPaymentDto = z.infer<typeof RefundPaymentSchema>;

export class PaymentService {
  // ----------------------------------------------------------
  // refund — TRANSACTION
  // ----------------------------------------------------------
  async refund(id: number, dto: RefundPaymentDto) {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!payment) {
      throw new AppError('PAYMENT_NOT_FOUND', 404, '결제 내역을 찾을 수 없습니다.');
    }

    if (payment.isRefunded) {
      throw new AppError('PAYMENT_ALREADY_REFUNDED', 400, '이미 환불된 결제입니다.');
    }

    if (payment.amount < dto.amount) {
      throw new AppError('INVALID_REFUND_AMOUNT', 400, '환불 금액이 원래 결제 금액보다 큽니다.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Process literal refund fields
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          isRefunded: true,
          refundAmount: dto.amount,
          refundReason: dto.reason,
          refundedAt: new Date(),
        },
      });

      // 2. (Optional Domain Rule) Cancel the subscription if full amount is refunded? 
      // Instructed to just do payment transaction for now: "update isRefunded + record refundAmount".
      // Kept scoped strictly to payment as requested.

      return updatedPayment;
    });

    logger.info({ paymentId: id, refundAmount: dto.amount }, 'Refund processed');
    return result;
  }
}

export const paymentService = new PaymentService();

/*
 * ============================================================
 * SMOKE TEST — Expected Input / Output
 * ============================================================
 *
 * [refund]
 *   input : id=1 (payment amount 50,000), { amount: 50000, reason: '고객 변심' }
 *   action: Transaction -> payment.isRefunded = true, .refundAmount = 50000 
 *   throws: AppError(PAYMENT_ALREADY_REFUNDED, 400) if already refunded
 *           AppError(INVALID_REFUND_AMOUNT, 400) if requested > 50000
 * ============================================================
 */
