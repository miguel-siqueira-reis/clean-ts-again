import { User } from '../../../Domain/models/user';

export interface AddAccountRepository {
  add(user: AddAccountRepository.Params): AddAccountRepository.Result;
}

export namespace AddAccountRepository {
  export type Params = Pick<User, 'name' | 'email' | 'password'>;
  export type Result = Promise<Pick<User, 'id' | 'name' | 'email' | 'password'>>;
}
