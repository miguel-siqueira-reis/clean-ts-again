import { FastifyInstance } from 'fastify';
import { makeSignUpController } from '../../../factories/controllers/signup-controller-adapter';
import { adapterRoute } from '../../adapters/routes';

export default (fastify: FastifyInstance, opts: any, done: any) => {
  fastify.post('/register', adapterRoute(makeSignUpController()));

  // show path route in console.log
  fastify.ready((err) => {
    if (err) throw err;
    fastify.printRoutes();
  });

  done();
};
