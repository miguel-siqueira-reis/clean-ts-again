import { MongoMemoryServer } from 'mongodb-memory-server';
import { afterAll, beforeAll, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { db } from './db';
import { UserRepsoitory } from './user-repository';

let mongoMemory: MongoMemoryServer;
let mongodb: typeof db;

const makeSut = () => {
  const sut = new UserRepsoitory();

  return { sut }
}

const makeFakeData = () => ({
  name: 'valid_name',
  email: 'valid@email.com',
  password: 'hashed_password',
})

describe('UserRepository mongodb', () => {
  beforeAll(async () => {
    mongoMemory = await MongoMemoryServer.create();    
    mongodb = db;
    await mongodb.connect(mongoMemory.getUri());
  });

  beforeEach(async () => {
    const collection = mongodb.getCollection('users');
    await collection.deleteMany({});
  })

  afterAll(async () => {
    mongodb.disconnect();
    await mongoMemory.stop();
  })

  describe('add()', () => {
    it('should return an user on success', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();
      const user = await sut.add(data);
  
      expect(user).toEqual({
        id: user.id,
        name: data.name,
        email: data.email,
        password: data.password,
      })
      expectTypeOf(user.id).toBeString();
    });
  
    it('should call right collection', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();
      const collectionSpy = vi.spyOn(mongodb, 'getCollection');
  
      await sut.add(data);
  
      expect(collectionSpy).toHaveBeenCalledWith('users');
    });

    it('should store user in database', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();;
  
      const user = await sut.add(data);
  
      const collection = mongodb.getCollection('users');
      const userDb = await collection.findOne({ _id: user.id } as any) as any;
  
      expect(user).toEqual({
        id: userDb._id,
        name: userDb.name,
        email: userDb.email,
        password: userDb.password,
      })
    });
  });

  describe('loadByEmail()', () => {
    it('should return an user if has a user with same email', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();
      const user = await sut.add(data);
  
      const userEmail = await sut.loadByEmail(data.email);
  
      expect(userEmail).toEqual(user)
    });
  
    it('should call right collection', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();
      const collectionSpy = vi.spyOn(mongodb, 'getCollection');
  
      await sut.add(data);
  
      expect(collectionSpy).toHaveBeenCalledWith('users');
    });
  
    it('should return null if email not exists', async () => {
      const { sut } = makeSut();
  
      const data = makeFakeData();
      const userDb = await sut.loadByEmail(data.email);
  
      expect(userDb).toBeNull();
    });
  })
})