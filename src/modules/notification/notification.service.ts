import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateNotificationDto } from './notification.schema';

export class NotificationService {
  async create(dto: CreateNotificationDto) {
    const member = await prisma.member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member || member.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Member not found');
    }

    return await prisma.notification.create({
      data: dto,
    });
  }

  async findById(id: number) {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new AppError('NOT_FOUND', 404, 'Notification not found');
    }

    return notification;
  }

  async markAsRead(id: number) {
    await this.findById(id);

    return await prisma.notification.update({
      where: { id },
      data: {
        status: 'READ',
        readAt: new Date(),
      },
    });
  }

  async pendingList(memberId: number) {
    return await prisma.notification.findMany({
      where: {
        memberId,
        status: 'PENDING',
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const notificationService = new NotificationService();
