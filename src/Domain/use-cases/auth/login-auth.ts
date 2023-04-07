import { Either } from '@/Shared/Either';
import { User } from '../../models/user';

export interface LoginAuth {
  login(credentials: LoginAuth.Request): LoginAuth.Response;
}

export interface Token {
  access_token: string;
  token_type: string;
  expires_in: string;
  refresh_token: string;
}

export namespace LoginAuth {
  export type Request = {
    email: string;
    password: string;
  };

  export type Response = Promise<
    Either<
      Error,
      {
        user: Pick<User, 'id' | 'name' | 'email'>;
        token: Token;
      }
    >
  >;
}
