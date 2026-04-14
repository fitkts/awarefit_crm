import { FastifyPluginAsync } from 'fastify';
import { staffService } from './staff.service';
import {
  CreateStaffSchema,
  UpdateStaffSchema,
  CreateCommissionRuleSchema
} from './staff.schema';

const staffRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/staffs', async (request, reply) => {
    const staffs = await staffService.findAll();
    return reply.send(staffs);
  });

  fastify.get('/staffs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const staff = await staffService.findById(Number(id));
    return reply.send(staff);
  });

  fastify.post('/staffs', async (request, reply) => {
    const dto = CreateStaffSchema.parse(request.body);
    const staff = await staffService.create(dto);
    return reply.status(201).send(staff);
  });

  fastify.patch('/staffs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = UpdateStaffSchema.parse(request.body);
    const staff = await staffService.update(Number(id), dto);
    return reply.send(staff);
  });

  fastify.delete('/staffs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await staffService.softDelete(Number(id));
    return reply.status(204).send();
  });

  // --- Sub-resource: Commission Rules ---

  fastify.get('/staffs/:id/commission-rules', async (request, reply) => {
    const { id } = request.params as { id: string };
    const rules = await staffService.getCommissionRules(Number(id));
    return reply.send(rules);
  });

  fastify.post('/staffs/:id/commission-rules', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = CreateCommissionRuleSchema.parse(request.body);
    const rule = await staffService.addCommissionRule(Number(id), dto);
    return reply.status(201).send(rule);
  });
};

export default staffRoutes;
