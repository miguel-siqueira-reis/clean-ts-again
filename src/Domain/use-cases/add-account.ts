import { Either } from '@/Shared/Either';
import { User } from '../models/user';

export interface AddAccount {
  add(data: AddAccount.Params): AddAccount.Result;
}

export namespace AddAccount {
  export type Params = Pick<User, 'name' | 'email' | 'password'>;

  export type Result = Promise<Either<Error, Pick<User, 'id' | 'name' | 'email'>>>;
}
