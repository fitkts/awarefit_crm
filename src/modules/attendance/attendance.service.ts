import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateAttendanceDto } from './attendance.schema';

export class AttendanceService {
  async findBySubscription(subId: number) {
    return await prisma.attendance.findMany({
      where: { subId },
      orderBy: { checkedAt: 'desc' },
      include: {
        staff: true,
        appointment: true,
      },
    });
  }

  async getSessionHistory(memberId: number) {
    return await prisma.attendance.findMany({
      where: {
        subscription: {
          memberId,
        },
      },
      orderBy: { checkedAt: 'desc' },
      include: {
        staff: true,
        subscription: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  // Support for manual attendance (direct check-in, no appointment)
  // Also serves as the mechanism for corrections since attendance is immutable
  async createDirect(dto: CreateAttendanceDto) {
    return await prisma.$transaction(async (tx) => {
      const subscription = await tx.subscription.findUnique({
        where: { id: dto.subId },
        include: { member: true },
      });

      if (!subscription || subscription.deletedAt) {
        throw new AppError('NOT_FOUND', 404, 'Subscription not found');
      }

      const staff = await tx.staff.findUnique({
        where: { id: dto.staffId },
      });

      if (!staff) {
        throw new AppError('NOT_FOUND', 404, 'Staff not found');
      }

      if (subscription.status !== 'ACTIVE') {
        throw new AppError('BAD_REQUEST', 400, `Cannot create attendance for subscription in status: ${subscription.status}`);
      }

      let sessionNumber: number | null = null;
      let newRemainingCnt = subscription.remainingCnt;

      if (subscription.remainingCnt > 0) {
        sessionNumber = subscription.totalCnt - subscription.remainingCnt + 1;
        newRemainingCnt -= 1;
      } else if (subscription.remainingCnt === -1) {
        // Unlimited case
        sessionNumber = null;
      } else {
        throw new AppError('BAD_REQUEST', 400, 'Subscription has no remaining sessions');
      }

      // Snapshot commValue
      let commValue = 0;
      const commissionRule = await tx.commissionRule.findFirst({
        where: {
          staffId: dto.staffId,
          type: 'PER_SESSION',
          OR: [
            { effectiveFrom: null, effectiveTo: null },
            { 
              effectiveFrom: { lte: new Date() },
              OR: [
                { effectiveTo: null },
                { effectiveTo: { gte: new Date() } }
              ]
            }
          ]
        },
        orderBy: { id: 'desc' }
      });

      if (commissionRule) {
        if (sessionNumber && sessionNumber >= commissionRule.minSessions && sessionNumber <= commissionRule.maxSessions) {
           commValue = commissionRule.rate;
        } else if (!sessionNumber) {
           commValue = commissionRule.rate;
        }
      }

      const attendance = await tx.attendance.create({
        data: {
          subId: dto.subId,
          staffId: dto.staffId,
          commValue,
          sessionNumber,
        },
      });

      let newSubStatus = subscription.status;
      if (newRemainingCnt === 0) {
        newSubStatus = 'EXPIRED';
      }

      if (newRemainingCnt !== subscription.remainingCnt || newSubStatus !== subscription.status) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            remainingCnt: newRemainingCnt,
            status: newSubStatus,
          },
        });
      }

      return attendance;
    });
  }

  // Deliberately omitting an update() method! 
  // CRITICAL RULE: Attendance is an immutable fact. Corrections are new records.
}

export const attendanceService = new AttendanceService();
