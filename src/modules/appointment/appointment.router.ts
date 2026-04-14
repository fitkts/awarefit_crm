import { FastifyPluginAsync } from 'fastify';
import { appointmentService } from './appointment.service';
import {
  CreateAppointmentSchema,
  UpdateAppointmentSchema,
  CancelAppointmentSchema,
  QueryAppointmentSchema,
} from './appointment.schema';

const appointmentRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/appointments', async (request, reply) => {
    // Basic standard query setup
    const query = QueryAppointmentSchema.parse(request.query);
    if (query.staffId && query.date) {
      const appointments = await appointmentService.findByStaff(query.staffId, query.date);
      return reply.send(appointments);
    } else if (query.subId) {
      // Could add findBySubId in service if needed, but not specified in prompt.
      // Assuming all if not matched
    }
    const appointments = await appointmentService.findAll();
    return reply.send(appointments);
  });

  fastify.get('/appointments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const appointment = await appointmentService.findById(Number(id));
    return reply.send(appointment);
  });

  fastify.get('/appointments/member/:memberId', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const appointments = await appointmentService.findByMember(Number(memberId));
    return reply.send(appointments);
  });

  fastify.post('/appointments', async (request, reply) => {
    const dto = CreateAppointmentSchema.parse(request.body);
    const appointment = await appointmentService.create(dto);
    return reply.status(201).send(appointment);
  });

  fastify.patch('/appointments/:id/complete', async (request, reply) => {
    const { id } = request.params as { id: string };
    const appointment = await appointmentService.complete(Number(id));
    return reply.send(appointment);
  });

  fastify.patch('/appointments/:id/cancel', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = CancelAppointmentSchema.parse(request.body);
    const appointment = await appointmentService.cancel(Number(id), dto.reason);
    return reply.send(appointment);
  });

  fastify.patch('/appointments/:id/noshow', async (request, reply) => {
    const { id } = request.params as { id: string };
    const appointment = await appointmentService.noShow(Number(id));
    return reply.send(appointment);
  });

  fastify.delete('/appointments/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await appointmentService.softDelete(Number(id));
    return reply.status(204).send();
  });
};

export default appointmentRoutes;
