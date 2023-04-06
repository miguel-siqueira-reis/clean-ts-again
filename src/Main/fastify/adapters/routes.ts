import { Controller } from '@/Presentation/protocols/controllers';
import { FastifyReply, FastifyRequest } from 'fastify';

export const adapterRoute = (controller: Controller) => async (req: FastifyRequest, reply: FastifyReply) => {
  const response = await controller.handle(req);
  reply.status(response.status).send(response.body);
};