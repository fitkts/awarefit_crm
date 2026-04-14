import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateGoalDto, UpdateGoalDto, QueryGoalDto } from './goal.schema';

export class GoalService {
  async findAll(query?: QueryGoalDto) {
    return await prisma.goal.findMany({
      where: {
        memberId: query?.memberId,
        status: query?.status,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: number) {
    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new AppError('NOT_FOUND', 404, 'Goal not found');
    }

    return goal;
  }

  async create(dto: CreateGoalDto) {
    return await prisma.goal.create({
      data: dto,
    });
  }

  async update(id: number, dto: UpdateGoalDto) {
    await this.findById(id);

    return await prisma.goal.update({
      where: { id },
      data: dto,
    });
  }

  async achieve(id: number) {
    const goal = await this.findById(id);

    if (goal.status === 'ACHIEVED') {
      throw new AppError('BAD_REQUEST', 400, 'Goal is already achieved');
    }

    return await prisma.goal.update({
      where: { id },
      data: {
        status: 'ACHIEVED',
        achievedAt: new Date(),
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);

    return await prisma.goal.delete({
      where: { id },
    });
  }
}

export const goalService = new GoalService();
