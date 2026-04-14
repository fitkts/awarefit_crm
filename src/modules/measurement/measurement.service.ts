import prisma from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { CreateMeasurementDto } from './measurement.schema';

export class MeasurementService {
  async create(dto: CreateMeasurementDto) {
    const member = await prisma.member.findUnique({
      where: { id: dto.memberId },
    });

    if (!member || member.deletedAt) {
      throw new AppError('NOT_FOUND', 404, 'Member not found');
    }

    return await prisma.measurement.create({
      data: dto,
    });
  }

  async listByMember(memberId: number) {
    return await prisma.measurement.findMany({
      where: { memberId },
      orderBy: { measuredAt: 'desc' },
    });
  }

  async findLatestByType(memberId: number, type: string) {
    const measurement = await prisma.measurement.findFirst({
      where: { memberId, type },
      orderBy: { measuredAt: 'desc' },
    });

    if (!measurement) {
      throw new AppError('NOT_FOUND', 404, `No measurement found of type ${type}`);
    }

    return measurement;
  }
}

export const measurementService = new MeasurementService();
