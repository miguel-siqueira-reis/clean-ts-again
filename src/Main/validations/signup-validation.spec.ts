import { describe, expect, it } from 'vitest';

import { SignupValidation } from './signup-validation';

const makeSut = () => {
  const sut = new SignupValidation();

  return {
    sut,
  };
};

const makeFakeInput = () => ({
  name: 'valid_name',
  email: 'valid@email.com',
  password: 'valid_password',
  passwordConfirmation: 'valid_password',
});

describe('SignupValidation', () => {
  it('should return an error if name is not provided', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      ...input,
      name: '',
    });

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('O nome é obrigatório');
  });

  it('should return an error if email is not provided', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      ...input,
      email: '',
    });

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('O email é obrigatório');
  });

  it('should return an error if email is invalid', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      ...input,
      email: 'invalid_email',
    });

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('O email é invalido');
  });

  it('should return an error if password is not provided or provide with less 6 letters', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      ...input,
      password: '12',
      passwordConfirmation: '12',
    });

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('A senha deve ser maior que 6 letras');
  });

  it('should return an error if passwordConfirmation is not provided', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      name: input.name,
      email: input.email,
      password: input.password,

    } as any);

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('A confirmação de senha é obrigatória');
  });

  it('should return an error if passwordConfirmation is not equal password', () => {
    const { sut } = makeSut();

    const input = makeFakeInput();

    const error = sut.validate({
      ...input,
      passwordConfirmation: 'invalid_password',
    });

    expect(error.isLeft()).toBe(true);
    expect(error.left()).toEqual('A confirmação de senha é inválida');
  });
});
