import prisma from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { AppError } from '@/lib/errors';
import type { CreateSubscriptionDto, PauseSubscriptionDto, TransferSubscriptionDto } from './subscription.schema';

export class SubscriptionService {
  // ----------------------------------------------------------
  // create — Subscription + Payment (transaction)
  // ----------------------------------------------------------
  async create(dto: CreateSubscriptionDto) {
    const product = await prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
    });

    if (!product) {
      throw new AppError('PRODUCT_NOT_FOUND', 404, '상품을 찾을 수 없습니다.');
    }

    // Rules 2 & 3: Session count and date calculation
    const totalCnt = product.sessionCnt;
    const remainingCnt = product.sessionCnt === -1 ? -1 : product.sessionCnt;
    
    const startDate = dto.startDate;
    const endDate = new Date(startDate);
    if (product.validDays === 0) {
      endDate.setFullYear(endDate.getFullYear() + 100); // Unlimited conceptually
    } else {
      endDate.setDate(endDate.getDate() + product.validDays);
    }

    const { paymentAmount, paymentMethod, ...subData } = dto;

    const [subscription] = await prisma.$transaction(async (tx) => {
      // 1. Create Subscription
      const createdSub = await tx.subscription.create({
        data: {
          memberId: subData.memberId,
          productId: subData.productId,
          staffId: subData.staffId,
          totalCnt,
          remainingCnt,
          startDate,
          endDate,
          originalPrice: product.price,
          discountAmount: subData.discountAmount,
          autoRenew: subData.autoRenew,
          notes: subData.notes,
          status: 'ACTIVE',
        },
      });

      // 2. Create associated Payment
      await tx.payment.create({
        data: {
          subId: createdSub.id,
          amount: paymentAmount,
          method: paymentMethod,
        },
      });

      return [createdSub];
    });

    logger.info({ subId: subscription.id }, 'Subscription created with payment');
    return subscription;
  }

  // ----------------------------------------------------------
  // findByMember
  // ----------------------------------------------------------
  async findByMember(memberId: number) {
    return prisma.subscription.findMany({
      where: { memberId, deletedAt: null },
      include: { product: true, payments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ----------------------------------------------------------
  // findActive
  // ----------------------------------------------------------
  async findActive(memberId: number) {
    return prisma.subscription.findMany({
      where: {
        memberId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        deletedAt: null,
      },
      include: { product: true },
    });
  }

  // ----------------------------------------------------------
  // pause
  // ----------------------------------------------------------
  async pause(id: number, dto: PauseSubscriptionDto) {
    const sub = await prisma.subscription.findUnique({ where: { id, deletedAt: null } });
    if (!sub) throw new AppError('SUB_NOT_FOUND', 404, '수강권을 찾을 수 없습니다.');
    if (sub.status !== 'ACTIVE') throw new AppError('SUB_NOT_ACTIVE', 400, '활성 상태의 수강권만 일시정지할 수 있습니다.');

    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'PAUSED',
        notes: sub.notes ? `${sub.notes}\n[PAUSED: ${dto.reason}]` : `[PAUSED: ${dto.reason}]`,
      },
    });
  }

  // ----------------------------------------------------------
  // cancel
  // ----------------------------------------------------------
  async cancel(id: number, reason: string) {
    const sub = await prisma.subscription.findUnique({ where: { id, deletedAt: null } });
    if (!sub) throw new AppError('SUB_NOT_FOUND', 404, '수강권을 찾을 수 없습니다.');

    return prisma.subscription.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: sub.notes ? `${sub.notes}\n[CANCELLED: ${reason}]` : `[CANCELLED: ${reason}]`,
      },
    });
  }

  // ----------------------------------------------------------
  // transfer — TRANSACTION (old transferred + new created + log created)
  // ----------------------------------------------------------
  async transfer(id: number, dto: TransferSubscriptionDto) {
    const fromSub = await prisma.subscription.findUnique({ where: { id, deletedAt: null } });
    if (!fromSub) throw new AppError('SUB_NOT_FOUND', 404, '수강권을 찾을 수 없습니다.');
    if (fromSub.status !== 'ACTIVE') throw new AppError('SUB_NOT_ACTIVE', 400, '활성 상태의 수강권만 양도할 수 있습니다.');

    if (fromSub.memberId === dto.toMemberId) {
      throw new AppError('INVALID_TRANSFER', 400, '자신에게 양도할 수 없습니다.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Mark old subscription as TRANSFERRED
      await tx.subscription.update({
        where: { id: fromSub.id },
        data: { status: 'TRANSFERRED' },
      });

      // 2. Create new subscription for the new member, cloning remaining values
      const toSub = await tx.subscription.create({
        data: {
          memberId: dto.toMemberId,
          productId: fromSub.productId,
          staffId: fromSub.staffId,
          totalCnt: fromSub.totalCnt,
          remainingCnt: fromSub.remainingCnt, // clones remaining count
          startDate: new Date(),
          endDate: fromSub.endDate, // retains original end date
          notes: `[TRANSFERRED from memberId: ${fromSub.memberId}] ${dto.reason || ''}`,
          transferredFromId: fromSub.id,
          status: 'ACTIVE',
        },
      });

      // 3. Create TransferLog
      await tx.transferLog.create({
        data: {
          fromMemberId: fromSub.memberId,
          toMemberId: dto.toMemberId,
          fromSubId: fromSub.id,
          toSubId: toSub.id,
          transferFee: dto.transferFee,
          reason: dto.reason,
        },
      });

      return toSub;
    });

    logger.info({ fromSubId: id, toSubId: result.id }, 'Subscription transferred');
    return result;
  }

  // ----------------------------------------------------------
  // decrementSession — RULE #1 & #4: must use transaction internally
  // ----------------------------------------------------------
  async decrementSession(id: number, by: number = 1) {
    return prisma.$transaction(async (tx) => {
      const sub = await tx.subscription.findUnique({ where: { id, deletedAt: null } });
      if (!sub) throw new AppError('SUB_NOT_FOUND', 404, '수강권을 찾을 수 없습니다.');
      if (sub.status !== 'ACTIVE') throw new AppError('SUB_NOT_ACTIVE', 400, '활성 상태가 아닙니다.');

      // RULE #2 implication: -1 is unlimited, do not decrement.
      if (sub.remainingCnt === -1) {
        return sub; 
      }

      if (sub.remainingCnt < by) {
        throw new AppError('INSUFFICIENT_SESSIONS', 400, '잔여 횟수가 부족합니다.');
      }

      const newRemaining = sub.remainingCnt - by;
      
      // RULE #4: Auto-transition to EXPIRED if 0
      const newStatus = newRemaining === 0 ? 'EXPIRED' : sub.status;

      const updated = await tx.subscription.update({
        where: { id },
        data: {
          remainingCnt: newRemaining,
          status: newStatus,
        },
      });

      return updated;
    });
  }
}

export const subscriptionService = new SubscriptionService();

/*
 * ============================================================
 * SMOKE TEST — Expected Input / Output
 * ============================================================
 *
 * [create]
 *   input : { memberId: 1, productId: 1, staffId: 2, startDate: '2026-04-14', paymentAmount: 500000, paymentMethod: 'CARD' }
 *   action: Transaction creates Subscription (remainingCnt = 10, endDate = 2026-07-13) + Payment (CARD 500000)
 *   throws: AppError(PRODUCT_NOT_FOUND, 404) if product doesn't exist
 *
 * [decrementSession]
 *   input : id=1, by=1
 *   action: Transaction -> sub.remainingCnt -= 1. If reaches 0, status -> 'EXPIRED'.
 *   throws: AppError(INSUFFICIENT_SESSIONS, 400) if remainingCnt < 1
 *
 * [transfer]
 *   input : id=1 (member A), { toMemberId: 2 (member B), transferFee: 50000 }
 *   action: Transaction -> (1) sub1 status='TRANSFERRED' 
 *                       -> (2) create sub2 for member B with same remainingCnt/endDate
 *                       -> (3) create TransferLog
 *   throws: AppError(SUB_NOT_ACTIVE, 400) if sub1 is not ACTIVE
 *           AppError(INVALID_TRANSFER, 400) if member A == member B
 * ============================================================
 */
