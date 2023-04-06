import { fastify, FastifyInstance } from 'fastify';

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { App } from '../types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class FastifyApp implements App {
  private readonly fastify: FastifyInstance;
  private readonly port: number;

  constructor(port = process.env.PORT || 3000) {
    this.fastify = fastify();
    this.port = port as number;
    this.route();
  }

  private route(): void {
    this.fastify.register(import('./routes/api/auth'), { prefix: '/api/auth' });
  }

  public async start(): Promise<void> {
    await this.fastify.listen({
      port: this.port,
    });
  }

  public async teardown(): Promise<void> {
    await this.fastify.close();
  }

  public getServer(): FastifyInstance {
    return this.fastify;
  }
}

export const app = new FastifyApp();
