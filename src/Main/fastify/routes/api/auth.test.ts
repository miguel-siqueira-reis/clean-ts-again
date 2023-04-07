import { FastifyInstance } from 'fastify';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { db } from '@/Infra/repositories/mongo-db/db';
import { app } from '@/Main/fastify/app';
import { Db } from '@/Main/types';

let mongoMemory: MongoMemoryServer;
let mongoDb: Db;

const server: FastifyInstance = app.getServer();

describe('auth register router', () => {
  beforeAll(async () => {
    mongoMemory = await MongoMemoryServer.create();
    mongoDb = db;
    await mongoDb.connect(mongoMemory.getUri());
    await app.start();
  });

  it('should return an user and status code 200 on request to /api/auth/register', async () => {
    const response = await server.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        name: 'valid_name',
        email: 'valid@mail.com',
        password: 'valid_password',
        passwordConfirmation: 'valid_password',
      },
    });

    const data = response.json();

    expect(response.statusCode).toBe(200);
    expect(data).toEqual({
      id: data.id,
      name: 'valid_name',
      email: 'valid@mail.com',
    });
  });

  afterAll(async () => {
    await app.teardown();
    await mongoDb.disconnect();
    await mongoMemory.stop();
  });
});
