import { User } from '@/Domain/models/user';

export interface FindUserByEmailRepository {
  loadByEmail(email: FindUserByEmailRepository.Params): FindUserByEmailRepository.Result;
}

export namespace FindUserByEmailRepository {
  export type Params = string;

  export type Result = Promise<User | null>;
}
