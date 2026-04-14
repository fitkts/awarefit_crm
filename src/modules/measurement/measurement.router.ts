import { FastifyPluginAsync } from 'fastify';
import { measurementService } from './measurement.service';
import { CreateMeasurementSchema } from './measurement.schema';

const measurementRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/measurements/member/:memberId', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const measurements = await measurementService.listByMember(Number(memberId));
    return reply.send(measurements);
  });

  fastify.get('/measurements/member/:memberId/latest/:type', async (request, reply) => {
    const { memberId, type } = request.params as { memberId: string, type: string };
    const measurement = await measurementService.findLatestByType(Number(memberId), type);
    return reply.send(measurement);
  });

  fastify.post('/measurements', async (request, reply) => {
    const dto = CreateMeasurementSchema.parse(request.body);
    const measurement = await measurementService.create(dto);
    return reply.status(201).send(measurement);
  });
};

export default measurementRoutes;
