import { GenerateToken } from '@/Data/protocols/auth/generate-token';
import { SaveTokenRepository } from '@/Data/protocols/auth/save-token-repository';
import { FindUserByEmailRepository } from '@/Data/protocols/repositories/find-user-email-repository';
import { describe, expect, it, vi } from 'vitest';
import { Auth } from './auth';

const makeFindUserByEmailRepositoryStub = () => {
  class FindUserByEmailRepositoryStub implements FindUserByEmailRepository {
    async loadByEmail(email: string): FindUserByEmailRepository.Result {
      return {
        id: 'valid_id',
        name: 'valid_name',
        email,
        password: 'valid_hash_password',
      };
    }
  }

  return new FindUserByEmailRepositoryStub();
};

const makeHashCompareStub = () => {
  class HashCompareStub implements HashCompareStub {
    async compare(value: string, hash: string): Promise<boolean> {
      return true;
    }
  }

  return new HashCompareStub();
};

const makeGenerateTokenStub = () => {
  class GenerateTokenStub implements GenerateToken {
    async generate(data: GenerateToken.Data): GenerateToken.Response {
      return {
        access_token: 'valid_token',
        token_type: 'Bearer',
        expires_in: 'valid_expires_in',
        refresh_token: 'valid_refresh_token',
      };
    }
  }

  return new GenerateTokenStub();
};

const makeSaveTokenRepositoryStub = () => {
  class SaveTokenRepositoryStub implements SaveTokenRepository {
    async saveToken(
      tokenData: SaveTokenRepository.Token,
      options: SaveTokenRepository.Options,
    ): SaveTokenRepository.Response {
      return;
    }
  }

  return new SaveTokenRepositoryStub();
};

const makeSut = () => {
  const hashCompareStub = makeHashCompareStub();
  const findUserByEmailRepositoryStub = makeFindUserByEmailRepositoryStub();
  const generateTokenStub = makeGenerateTokenStub();
  const saveTokenRepositoryStub = makeSaveTokenRepositoryStub();
  const sut = new Auth(
    findUserByEmailRepositoryStub,
    hashCompareStub,
    generateTokenStub,
    saveTokenRepositoryStub,
  );

  return {
    sut,
    findUserByEmailRepositoryStub,
    hashCompareStub,
    generateTokenStub,
    saveTokenRepositoryStub,
  };
};

const makeFakeCredentials = () => ({
  email: 'valid@email.com',
  password: 'valid_password',
});

describe('LoginAuth', () => {
  it('should return user and token when login with valid credentials', async () => {
    const { sut } = makeSut();

    const res = await sut.login(makeFakeCredentials());

    expect(res.isRight()).toBe(true);
    expect(res.right()).toEqual({
      user: {
        id: 'valid_id',
        name: 'valid_name',
        email: makeFakeCredentials().email,
      },
      token: {
        access_token: 'valid_token',
        token_type: 'Bearer',
        expires_in: 'valid_expires_in',
        refresh_token: 'valid_refresh_token',
      },
    });
  });

  it('should call loadByEmail method with correct email', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    const loadByEmailSpy = vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail');

    await sut.login(makeFakeCredentials());

    expect(loadByEmailSpy).toHaveBeenCalledWith(makeFakeCredentials().email);
  });

  it('should return error when loadByEmail method returns null', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail').mockResolvedValueOnce(null);

    const res = await sut.login(makeFakeCredentials());

    expect(res.isLeft()).toBe(true);
    expect(res.left()).toEqual(new Error('Usuário não encontrado'));
  });

  it('should return error when loadByEmail method throws', async () => {
    const { sut, findUserByEmailRepositoryStub } = makeSut();

    vi.spyOn(findUserByEmailRepositoryStub, 'loadByEmail').mockRejectedValueOnce(new Error('any_error'));

    const res = sut.login(makeFakeCredentials());

    expect(res).rejects.toEqual(new Error('any_error'));
  });

  it('should call compare with correct params', async () => {
    const { sut, hashCompareStub } = makeSut();

    const compareSpy = vi.spyOn(hashCompareStub, 'compare');

    await sut.login(makeFakeCredentials());

    expect(compareSpy).toHaveBeenCalledWith(makeFakeCredentials().password, 'valid_hash_password');
  });

  it('should return error when compare method returns false', async () => {
    const { sut, hashCompareStub } = makeSut();

    vi.spyOn(hashCompareStub, 'compare').mockResolvedValueOnce(false);

    const res = await sut.login(makeFakeCredentials());

    expect(res.isLeft()).toBe(true);
    expect(res.left()).toEqual(new Error('Senha inválida'));
  });

  it('should return error when compare method throws', async () => {
    const { sut, hashCompareStub } = makeSut();

    vi.spyOn(hashCompareStub, 'compare').mockRejectedValueOnce(new Error('any_error'));

    const res = sut.login(makeFakeCredentials());

    expect(res).rejects.toEqual(new Error('any_error'));
  });

  it('should call generateToken with correct params', async () => {
    const { sut, generateTokenStub } = makeSut();

    const generateTokenSpy = vi.spyOn(generateTokenStub, 'generate');

    await sut.login(makeFakeCredentials());

    expect(generateTokenSpy).toHaveBeenCalledWith({
      id: 'valid_id',
      name: 'valid_name',
      email: makeFakeCredentials().email,
    });
  });

  it('should return error when generateToken method throws', async () => {
    const { sut, generateTokenStub } = makeSut();

    vi.spyOn(generateTokenStub, 'generate').mockRejectedValueOnce(new Error('any_error'));

    const res = sut.login(makeFakeCredentials());

    expect(res).rejects.toEqual(new Error('any_error'));
  });

  it('should save token in saveTokenRepository with correct params', async () => {
    const { sut, saveTokenRepositoryStub } = makeSut();

    const saveTokenSpy = vi.spyOn(saveTokenRepositoryStub, 'saveToken');

    await sut.login(makeFakeCredentials());

    expect(saveTokenSpy).toHaveBeenCalledWith(
      {
        access_token: 'valid_token',
        token_type: 'Bearer',
        expires_in: 'valid_expires_in',
        refresh_token: 'valid_refresh_token',
      },
      {
        id: 'valid_id',
        model: 'user',
        ability: ['*'],
      },
    );
  });

  it('should return error when saveTokenRepository method throws', async () => {
    const { sut, saveTokenRepositoryStub } = makeSut();

    vi.spyOn(saveTokenRepositoryStub, 'saveToken').mockRejectedValueOnce(new Error('any_error'));

    const res = sut.login(makeFakeCredentials());

    expect(res).rejects.toEqual(new Error('any_error'));
  });
});
