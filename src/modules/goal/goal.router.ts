import { FastifyPluginAsync } from 'fastify';
import { goalService } from './goal.service';
import {
  CreateGoalSchema,
  UpdateGoalSchema,
  QueryGoalSchema,
} from './goal.schema';

const goalRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/goals', async (request, reply) => {
    const query = QueryGoalSchema.parse(request.query);
    const goals = await goalService.findAll(query);
    return reply.send(goals);
  });

  fastify.get('/goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const goal = await goalService.findById(Number(id));
    return reply.send(goal);
  });

  fastify.post('/goals', async (request, reply) => {
    const dto = CreateGoalSchema.parse(request.body);
    const goal = await goalService.create(dto);
    return reply.status(201).send(goal);
  });

  fastify.patch('/goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = UpdateGoalSchema.parse(request.body);
    const goal = await goalService.update(Number(id), dto);
    return reply.send(goal);
  });

  fastify.patch('/goals/:id/achieve', async (request, reply) => {
    const { id } = request.params as { id: string };
    const goal = await goalService.achieve(Number(id));
    return reply.send(goal);
  });

  fastify.delete('/goals/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await goalService.delete(Number(id));
    return reply.status(204).send();
  });
};

export default goalRoutes;
