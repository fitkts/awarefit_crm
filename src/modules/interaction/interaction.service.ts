import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateInteractionDto } from './interaction.schema';

export class InteractionService {
  async listByMember(memberId: number) {
    return await prisma.interaction.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateInteractionDto) {
    const member = await prisma.member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member || member.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Member not found');
    }

    return await prisma.interaction.create({
      data: dto,
    });
  }
}

export const interactionService = new InteractionService();
