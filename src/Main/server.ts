import * as dotenv from 'dotenv';
dotenv.config();

import { db } from '../Infra/repositories/mongo-db/db';
import { app } from './fastify/app';
import { App, Db } from './types';

export const setupServer = async (app: App, db: Db) => {
  await db.connect();
  await app.start();
  
  return {
    app
  };
}

export const teardownServer = async (app: App, db: Db) => {
  await app.teardown();
  await db.disconnect();
}

try {
  await setupServer(app, db);
} catch (error) {
  console.error(error);
  await teardownServer(app, db);
}
