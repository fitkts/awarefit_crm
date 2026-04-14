import { FastifyPluginAsync } from 'fastify';
import { attendanceService } from './attendance.service';
import { CreateAttendanceSchema, QueryAttendanceSchema } from './attendance.schema';

const attendanceRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/attendances', async (request, reply) => {
    const query = QueryAttendanceSchema.parse(request.query);
    
    if (query.subId) {
      const attendances = await attendanceService.findBySubscription(query.subId);
      return reply.send(attendances);
    } else if (query.memberId) {
      const attendances = await attendanceService.getSessionHistory(query.memberId);
      return reply.send(attendances);
    }
    
    return reply.send([]);
  });

  fastify.post('/attendances/direct', async (request, reply) => {
    const dto = CreateAttendanceSchema.parse(request.body);
    const attendance = await attendanceService.createDirect(dto);
    return reply.status(201).send(attendance);
  });
};

export default attendanceRoutes;
