import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateWorkoutLogDto, UpdateWorkoutLogDto, QueryWorkoutLogDto } from './workout.schema';

export class WorkoutService {
  async findAll(query?: QueryWorkoutLogDto) {
    return await prisma.workoutLog.findMany({
      where: {
        memberId: query?.memberId,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        sets: {
          orderBy: { setNo: 'asc' }
        },
        exercise: true,
      }
    });
  }

  async findById(id: number) {
    const workout = await prisma.workoutLog.findUnique({
      where: { id },
      include: {
        sets: {
          orderBy: { setNo: 'asc' }
        },
        exercise: true,
      }
    });

    if (!workout) {
      throw new AppError('NOT_FOUND', 404, 'Workout log not found');
    }

    return workout;
  }

  async create(dto: CreateWorkoutLogDto) {
    const { sets, ...logData } = dto;

    return await prisma.workoutLog.create({
      data: {
        ...logData,
        sets: {
          create: sets
        }
      },
      include: {
        sets: true,
      }
    });
  }

  async update(id: number, dto: UpdateWorkoutLogDto) {
    await this.findById(id);

    const { sets, ...logData } = dto;

    return await prisma.$transaction(async (tx) => {
      // Update basic fields
      const updatedLog = await tx.workoutLog.update({
        where: { id },
        data: logData,
      });

      // If sets are provided, completely replace existing sets
      if (sets && Array.isArray(sets)) {
        await tx.workoutSet.deleteMany({
          where: { workoutLogId: id },
        });

        if (sets.length > 0) {
          await tx.workoutSet.createMany({
            data: sets.map(s => ({
              ...s,
              workoutLogId: id,
            }))
          });
        }
      }

      return tx.workoutLog.findUnique({
        where: { id },
        include: { sets: { orderBy: { setNo: 'asc' } } }
      });
    });
  }

  async delete(id: number) {
    await this.findById(id);

    // Hard delete for logs as there's no deletedAt column provided in schema
    return await prisma.workoutLog.delete({
      where: { id },
    });
  }
}

export const workoutService = new WorkoutService();
