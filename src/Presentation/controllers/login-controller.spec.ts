import { LoginAuth } from '@/Domain/use-cases/auth/login-auth';
import { Either } from '@/Shared/Either';
import { describe, expect, it, vi } from 'vitest';
import { BadRequest, ServerError } from '../helpers/http';
import { Validation } from '../protocols/validation';
import { LoginController } from './login-controller';

const makeValidationStub = () => {
  class ValidationStub implements Validation<LoginController.Request, string> {
    validate(input: LoginController.Request): Either<string, null> {
      return Either.right(null);
    }
  }
  return new ValidationStub();
};

const makeAuthLoginStub = () => {
  class authLoginStub implements LoginAuth {
    async login(credentials: LoginAuth.Request): LoginAuth.Response {
      return Either.right({
        user: {
          id: 'valid_id',
          name: 'valid_name',
          email: credentials.email,
        },
        token: {
          access_token: 'valid_token',
          token_type: 'Bearer',
          expires_in: 'valid_expires_in',
          refresh_token: 'valid_refresh_token',
        },
      });
    }
  }

  return new authLoginStub();
};

const makeSut = () => {
  const validationStub = makeValidationStub();
  const authLoginStub = makeAuthLoginStub();
  const sut = new LoginController(validationStub, authLoginStub);
  return {
    sut,
    validationStub,
    authLoginStub,
  };
};

const makeFakeCredentials = () => ({
  email: 'valid@email.com',
  password: 'valid_password',
});

describe('LoginController', () => {
  it('should login user with right credentials', async () => {
    const { sut } = makeSut();

    const res = await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      user: {
        id: 'valid_id',
        name: 'valid_name',
        email: 'valid@email.com',
      },
      token: {
        access_token: 'valid_token',
        token_type: 'Bearer',
        expires_in: 'valid_expires_in',
        refresh_token: 'valid_refresh_token',
      },
    });
  });

  it('should provide props request to validate method', async () => {
    const { sut, validationStub } = makeSut();

    const validationSpy = vi.spyOn(validationStub, 'validate');

    await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(validationSpy).toHaveBeenCalledWith(makeFakeCredentials());
  });

  it('should returns 400 if validatin fails', async () => {
    const { sut, validationStub } = makeSut();

    vi.spyOn(validationStub, 'validate').mockReturnValueOnce(Either.left('any_error'));

    const res = await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(res.status).toBe(400);
    expect(res).toEqual(BadRequest(Error('any_error')));
  });

  it('should returns 500 if validations throws', async () => {
    const { sut, validationStub } = makeSut();

    vi.spyOn(validationStub, 'validate').mockImplementationOnce(() => {
      throw new Error('any_error');
    });

    const res = await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(res.status).toBe(500);
    expect(res).toEqual(ServerError(Error('any_error')));
  });

  it('should provide right params to login method', async () => {
    const { sut, authLoginStub } = makeSut();

    const loginSpy = vi.spyOn(authLoginStub, 'login');

    await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(loginSpy).toHaveBeenCalledWith({
      email: 'valid@email.com',
      password: 'valid_password',
    });
  });

  it('should return a error if login is wrong', async () => {
    const { sut, authLoginStub } = makeSut();

    vi.spyOn(authLoginStub, 'login').mockReturnValueOnce(
      Promise.resolve(Either.left(new Error('any_error'))),
    );

    const res = await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(res.status).toBe(400);
    expect(res).toEqual(BadRequest(Error('any_error')));
  });

  it('should return 500 if login throws', async () => {
    const { sut, authLoginStub } = makeSut();

    vi.spyOn(authLoginStub, 'login').mockImplementationOnce(() => {
      throw new Error('any_error');
    });

    const res = await sut.handle({
      body: makeFakeCredentials(),
    });

    expect(res.status).toBe(500);
    expect(res).toEqual(ServerError(Error('any_error')));
  });
});
