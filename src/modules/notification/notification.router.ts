import { FastifyPluginAsync } from 'fastify';
import { notificationService } from './notification.service';
import { CreateNotificationSchema } from './notification.schema';

const notificationRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/notifications/member/:memberId/pending', async (request, reply) => {
    const { memberId } = request.params as { memberId: string };
    const notifications = await notificationService.pendingList(Number(memberId));
    return reply.send(notifications);
  });

  fastify.post('/notifications', async (request, reply) => {
    const dto = CreateNotificationSchema.parse(request.body);
    const notification = await notificationService.create(dto);
    return reply.status(201).send(notification);
  });

  fastify.patch('/notifications/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    const notification = await notificationService.markAsRead(Number(id));
    return reply.send(notification);
  });
};

export default notificationRoutes;
