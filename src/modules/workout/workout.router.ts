import { FastifyPluginAsync } from 'fastify';
import { workoutService } from './workout.service';
import {
  CreateWorkoutLogSchema,
  UpdateWorkoutLogSchema,
  QueryWorkoutLogSchema,
} from './workout.schema';

const workoutRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/workouts', async (request, reply) => {
    const query = QueryWorkoutLogSchema.parse(request.query);
    const workouts = await workoutService.findAll(query);
    return reply.send(workouts);
  });

  fastify.get('/workouts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const workout = await workoutService.findById(Number(id));
    return reply.send(workout);
  });

  fastify.post('/workouts', async (request, reply) => {
    const dto = CreateWorkoutLogSchema.parse(request.body);
    const workout = await workoutService.create(dto);
    return reply.status(201).send(workout);
  });

  fastify.patch('/workouts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const dto = UpdateWorkoutLogSchema.parse(request.body);
    const workout = await workoutService.update(Number(id), dto);
    return reply.send(workout);
  });

  fastify.delete('/workouts/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await workoutService.delete(Number(id));
    return reply.status(204).send();
  });
};

export default workoutRoutes;
