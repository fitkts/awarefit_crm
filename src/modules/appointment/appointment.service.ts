import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateAppointmentDto, UpdateAppointmentDto } from './appointment.schema';

export class AppointmentService {
  async create(dto: CreateAppointmentDto) {
    const { subId, staffId, startTime, endTime, notes } = dto;

    // 1. Fetch related Staff and Subscription to validate
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
    });
    if (!staff) {
      throw new AppError('NOT_FOUND', 404, 'Staff not found');
    }

    const subscription = await prisma.subscription.findUnique({
      where: { id: subId },
      include: { member: true },
    });
    if (!subscription || subscription.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Subscription not found or deleted');
    }

    if (subscription.status !== 'ACTIVE') {
      throw new AppError('BAD_REQUEST', 400, `Cannot create appointment for subscription in status: ${subscription.status}`);
    }

    if (subscription.staffId !== staffId) {
      // Logic could allow other staff to train, but we assume we just proceed or warn. We will let it pass for flexibility, unless specified.
    }

    const centerId = staff.centerId;
    const startOfDay = new Date(startTime);
    startOfDay.setHours(0, 0, 0, 0);

    // 2. Check Holiday table
    const holiday = await prisma.holiday.findFirst({
      where: {
        centerId,
        date: {
          gte: startOfDay,
          lt: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000),
        },
      },
    });

    if (holiday) {
      throw new AppError('BAD_REQUEST', 400, `Cannot schedule appointment on holiday: ${holiday.name || 'Holiday'}`);
    }

    // 3. Check staff availability (no overlap)
    // Only check against SCHEDULED appointments
    const overlap = await prisma.appointment.findFirst({
      where: {
        staffId,
        status: 'SCHEDULED',
        deletedAt: null,
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime },
          },
        ],
      },
    });

    if (overlap) {
      throw new AppError('CONFLICT', 409, 'Staff already has an overlapping appointment scheduled');
    }

    // 4. Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        subId,
        staffId,
        startTime,
        endTime,
        notes,
        status: 'SCHEDULED',
      },
    });

    return appointment;
  }

  async complete(id: number) {
    return await prisma.$transaction(async (tx) => {
      // 1. Fetch Appointment + Subscription (lock them conceptually if needed, here we just read)
      const appointment = await tx.appointment.findUnique({
        where: { id },
        include: { subscription: true },
      });

      if (!appointment || appointment.deletedAt) {
        throw new AppError('NOT_FOUND', 404, 'Appointment not found');
      }

      if (appointment.status !== 'SCHEDULED') {
        throw new AppError('BAD_REQUEST', 400, `Cannot complete an appointment with status ${appointment.status}`);
      }

      const { subscription } = appointment;

      // 2. Appointment status -> COMPLETED
      const updatedAppointment = await tx.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      });

      // Calculate session number (1-based)
      let sessionNumber: number | null = null;
      let newRemainingCnt = subscription.remainingCnt;

      if (subscription.remainingCnt > 0) {
        sessionNumber = subscription.totalCnt - subscription.remainingCnt + 1;
        newRemainingCnt -= 1;
      } else if (subscription.remainingCnt === -1) {
        // Unlimited case
        sessionNumber = null;
      } else {
        // 0 case
        // already expired, shouldn't happen if they checked before, but safeguard
      }

      // Snapshot commValue
      let commValue = 0;
      const commissionRule = await tx.commissionRule.findFirst({
        where: {
          staffId: appointment.staffId,
          type: 'PER_SESSION',
          // Assuming we pick active rules by effectiveFrom / To. If not set, it's always active
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
        orderBy: { id: 'desc' } // pick latest if multiple
      });

      if (commissionRule) {
        // Evaluate based on session Number if provided
        if (sessionNumber && sessionNumber >= commissionRule.minSessions && sessionNumber <= commissionRule.maxSessions) {
           commValue = commissionRule.rate;
        } else if (!sessionNumber) {
           commValue = commissionRule.rate; // fallback for unlimited
        }
      }

      // 3. Create Attendance record
      await tx.attendance.create({
        data: {
          subId: appointment.subId,
          staffId: appointment.staffId,
          apptId: appointment.id,
          commValue,
          sessionNumber,
        },
      });

      // 4. Update Subscription logic
      let newSubStatus = subscription.status;
      if (newRemainingCnt === 0) {
        newSubStatus = 'EXPIRED';
      }

      // Check if we need to update
      if (newRemainingCnt !== subscription.remainingCnt || newSubStatus !== subscription.status) {
        await tx.subscription.update({
          where: { id: subscription.id },
          data: {
            remainingCnt: newRemainingCnt,
            status: newSubStatus,
          },
        });
      }

      return updatedAppointment;
    });
  }

  async cancel(id: number, reason: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Appointment not found');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new AppError('BAD_REQUEST', 400, 'Only SCHEDULED appointments can be cancelled');
    }

    const appendNote = appointment.notes ? `${appointment.notes}\nCancel Reason: ${reason}` : `Cancel Reason: ${reason}`;

    return await prisma.appointment.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        notes: appendNote,
      },
    });
  }

  async noShow(id: number) {
    const appointment = await prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment || appointment.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Appointment not found');
    }

    if (appointment.status !== 'SCHEDULED') {
      throw new AppError('BAD_REQUEST', 400, 'Only SCHEDULED appointments can be marked as NOSHOW');
    }

    return await prisma.appointment.update({
      where: { id },
      data: { status: 'NOSHOW' },
    });
  }

  async findByStaff(staffId: number, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);

    return await prisma.appointment.findMany({
      where: {
        staffId,
        deletedAt: null,
        startTime: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
      orderBy: { startTime: 'asc' },
      include: {
        subscription: {
          include: { member: true }
        }
      }
    });
  }

  async findByMember(memberId: number) {
    return await prisma.appointment.findMany({
      where: {
        deletedAt: null,
        subscription: {
          memberId,
        },
      },
      orderBy: { startTime: 'desc' },
      include: {
        staff: true,
      }
    });
  }

  async findById(id: number) {
    const appt = await prisma.appointment.findUnique({
      where: { id },
      include: {
        subscription: { include: { member: true } },
        staff: true,
      }
    });

    if (!appt || appt.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Appointment not found');
    }
    return appt;
  }

  async findAll() {
    return await prisma.appointment.findMany({
      where: { deletedAt: null },
      orderBy: { startTime: 'desc' }
    });
  }

  async softDelete(id: number) {
    return await prisma.appointment.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}

export const appointmentService = new AppointmentService();
