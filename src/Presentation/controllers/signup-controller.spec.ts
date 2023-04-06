import { describe, expect, it, vi } from 'vitest';
import { AddAccount } from '../../Domain/use-cases/add-account';
import { Either } from '../../Shared/Either';
import { Validation } from '../protocols/validation';

import { SignupController } from './signup-controller';

const makeValidation = () => {
  class SignupValidationStub implements Validation<any, null> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    validate(input: any): Either<any, null> {
      return Either.right(null);
    }
  }

  return new SignupValidationStub();
};

const makeAddAccount = () => {
  class AddAccountStub implements AddAccount {
    async add(user: AddAccount.Params): AddAccount.Result {
      return Either.right({
        id: 'valid_id',
        name: user.name,
        email: user.email,
      });
    }
  }

  return new AddAccountStub();
};

const makeSut = () => {
  const validationStub = makeValidation();
  const addAccountStub = makeAddAccount();
  const sut = new SignupController(validationStub, addAccountStub);

  return {
    sut,
    validationStub,
    addAccountStub,
  };
};

const makeFakeRequest = () => ({
  name: 'valid_name',
  email: 'email@valid.com',
  password: 'valid_password',
  passwordConfirmation: 'valid_password',
});

describe('SignupController', () => {
  it('should return 200 if valid data is provided', async () => {
    const { sut } = makeSut();

    const req = makeFakeRequest();

    const res = await sut.handle({
      body: makeFakeRequest(),
    });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      id: 'valid_id',
      name: req.name,
      email: req.email,
    });
  });

  it('should return 400 if validation fails', async () => {
    const { sut, validationStub } = makeSut();

    vi.spyOn(validationStub, 'validate').mockReturnValueOnce(Either.left('O nome é obrigatório'));

    const res = await sut.handle({
      body: makeFakeRequest(),
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'O nome é obrigatório',
    });
  });

  it('should call validation with correct values', async () => {
    const { sut, validationStub } = makeSut();

    const validateSpy = vi.spyOn(validationStub, 'validate');

    const req = makeFakeRequest();

    await sut.handle({
      body: req,
    });

    expect(validateSpy).toHaveBeenCalledWith(req);
  });

  it('should call add account with correct values', async () => {
    const { sut, addAccountStub } = makeSut();

    const addSpy = vi.spyOn(addAccountStub, 'add');

    const req = makeFakeRequest();

    await sut.handle({
      body: req,
    });

    expect(addSpy).toHaveBeenCalledWith({
      name: req.name,
      email: req.email,
      password: req.password,
    });
    expect(addSpy).toHaveBeenCalledTimes(1);
  });

  it('should return 500 if add account throws', async () => {
    const { sut, addAccountStub } = makeSut();

    vi.spyOn(addAccountStub, 'add').mockImplementationOnce(() => {
      throw new Error();
    });

    const res = await sut.handle({
      body: makeFakeRequest(),
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Ocorreu um erro inesperado',
    });
  });

  it('should returns badRequest if addAccount have same error', async () => {
    const { sut, addAccountStub } = makeSut();

    vi.spyOn(addAccountStub, 'add').mockImplementationOnce(
      () => Either.left(new Error('O email já está em uso')) as any,
    );

    const res = await sut.handle({
      body: makeFakeRequest(),
    });

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: 'O email já está em uso',
    });
  });

  it('should return 500 if validation throws', async () => {
    const { sut, validationStub } = makeSut();

    vi.spyOn(validationStub, 'validate').mockImplementationOnce(() => {
      throw new Error();
    });

    const req = makeFakeRequest();
    const res = await sut.handle({
      body: req,
    });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'Ocorreu um erro inesperado',
    });
  });
});
