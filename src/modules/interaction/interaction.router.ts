import { FastifyPluginAsync } from 'fastify';
import { interactionService } from './interaction.service';
import { CreateInteractionSchema } from './interaction.schema';

const interactionRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/interactions/member/:memberId', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const interactions = await interactionService.listByMember(Number(memberId));
    return reply.send(interactions);
  });

  fastify.post('/interactions', async (request, reply) => {
    const dto = CreateInteractionSchema.parse(request.body);
    const interaction = await interactionService.create(dto);
    return reply.status(201).send(interaction);
  });
};

export default interactionRoutes;
