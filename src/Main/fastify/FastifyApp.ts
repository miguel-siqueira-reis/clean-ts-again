import autoload from '@fastify/autoload';
import { fastify, FastifyInstance } from 'fastify';
import path from 'node:path';
import { App } from '../types';
import { __dirname } from './app';


export class FastifyApp implements App {
  private readonly server: FastifyInstance;

  constructor() {
    this.server = fastify();
    this.route();
  }

  private route(): void {
    this.server.register(autoload, {
      dir: path.resolve(__dirname, `./routes`),
      ignorePattern: /.*\.test\.ts$/,
    });
  }

  public async start(port: number): Promise<void> {
    await this.server.listen({
      port,
    });
  }

  public async teardown(): Promise<void> {
    await this.server.close();
  }

  public getServer(): FastifyInstance {
    return this.server;
  }
}
