import { AddAccountRepository } from '@/Data/protocols/repositories/add-account-repository';
import { FindUserByEmailRepository } from '@/Data/protocols/repositories/find-user-repository';
import { User } from '@/Domain/models/user';
import { db } from '../../../Infra/repositories/mongo-db/db';

export class UserRepsoitory implements AddAccountRepository, FindUserByEmailRepository {
  async add(user: AddAccountRepository.Params): AddAccountRepository.Result {
    const collection = db.getCollection('users');
    const result = await collection.insertOne(user);
    const userDb = db.map<User>(await collection.findOne({ _id: result.insertedId }));

    return {
      id: userDb.id,
      name: userDb.name,
      email: userDb.email,
      password: userDb.password,
    }
  }

  async loadByEmail(email: FindUserByEmailRepository.Params): FindUserByEmailRepository.Result {
      const collection = db.getCollection('users');
      const result = await collection.findOne({ email });

      return result ? db.map<User>(result) : null;
  }
}
