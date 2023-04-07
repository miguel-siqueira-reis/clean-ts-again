import { describe, expect, it, vi } from 'vitest';
import { Either } from '../../Shared/Either';
import { Encrypter } from '../protocols/cryptography/encrypter';
import { AddAccountRepository } from '../protocols/repositories/add-account-repository';
import { FindUserByEmailRepository } from '../protocols/repositories/find-user-email-repository';
import { DbAddAccount } from './add-account';

const makeAddAccountRepositoryStub = () => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(user: AddAccountRepository.Params): AddAccountRepository.Result {
      return {
        id: 'valid_id',
        name: user.name,
        email: user.email,
        password: user.password,
      };
    }
  }

  return new AddAccountRepositoryStub();
};

const makeFindUserByEmailRepositoryStub = () => {
  class FindUserByEmailRepositoryStub implements FindUserByEmailRepository {
    async loadByEmail(email: FindUserByEmailRepository.Params): FindUserByEmailRepository.Result {
      return null;
    }
  }

  return new FindUserByEmailRepositoryStub();
};

const makeEncrypterStub = () => {
  class EncrypterStub implements Encrypter {
    async encrypt(password: string): Promise<string> {
      return 'hashed_password';
    }
  }

  return new EncrypterStub();
};

const makeSut = () => {
  const repositorStub = makeAddAccountRepositoryStub();
  const findUserByEmailRepositoryStub = makeFindUserByEmailRepositoryStub();
  const encrypterStub = makeEncrypterStub();
  const sut = new DbAddAccount(repositorStub, findUserByEmailRepositoryStub, encrypterStub);

  return {
    sut,
    repositorStub,
    findUserByEmailRepositoryStub,
    encrypterStub,
  };
};

const makeFakeData = () => ({
  name: 'valid_name',
  email: 'vallid@email.com',
  password: 'hashed_password',
});

describe('addAccount', () => {
  it('should return account if all be ok', async () => {
    const { sut } = makeSut();

    const data = makeFakeData();

    const account = await sut.add(data);

    expect(account).toEqual(
      Either.right({
        id: 'valid_id',
        name: data.name,
        email: data.email,
      }),
    );
  });

  it('should call AddAccountRepository with correct values', async () => {
    const { sut, repositorStub } = makeSut();

    const data = makeFakeData();
    const addSpy = vi.spyOn(repositorStub, 'add');

    await sut.add(data);

    expect(addSpy).toHaveBeenCalledWith(data);
  });

  it('should throw if AddAccountRepository throws', async () => {
    const { sut, repositorStub } = makeSut();

    const data = makeFakeData();
    vi.spyOn(repositorStub, 'add').mockRejectedValueOnce(new Error());

    const account = sut.add(data);

    await expect(account).rejects.toThrow();
  });

  it('should call FindUserByEmailRepository with correct values', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    const data = makeFakeData();
    const loadByEmailSpy = vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail');

    await sut.add(data);

    expect(loadByEmailSpy).toHaveBeenCalledWith(data.email);
  });

  it('should throw if FindUserByEmailRepository throws', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    const data = makeFakeData();
    vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail').mockRejectedValueOnce(new Error());

    const account = sut.add(data);

    await expect(account).rejects.toThrow();
  });

  it('should return error message if FindUserByEmailRepository returns user', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    const data = makeFakeData();
    vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce({
      id: 'valid_id',
      ...data,
    });

    const account = await sut.add(data);

    expect(account).toEqual(Either.left(new Error('Email já cadastrado')));
  });

  it('should call Encrypter with correct values', async () => {
    const { sut, encrypterStub } = makeSut();

    const data = makeFakeData();
    const encryptSpy = vi.spyOn(encrypterStub, 'encrypt');

    await sut.add(data);

    expect(encryptSpy).toHaveBeenCalledWith(data.password);
  });

  it('should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();

    const data = makeFakeData();
    vi.spyOn(encrypterStub, 'encrypt').mockRejectedValueOnce(new Error());

    const account = sut.add(data);

    await expect(account).rejects.toThrow();
  });
});
