import { describe, expect, it, vi } from 'vitest';
import { BcryptAdapter } from './bcrypt-adatper';

import bcrypt from 'bcrypt';

vi.mock('bcrypt');

const salt = 12;
const makeSut = () => {
  const sut = new BcryptAdapter(salt);
  return {
    sut,
  };
};

describe('Bcrypt Adapter', () => {
  it('Should call bcrypt with correct values', async () => {
    const { sut } = makeSut();

    const mockedBcrypt = vi.mocked(bcrypt).hash.mockResolvedValueOnce();

    await sut.encrypt('any_value');
    expect(mockedBcrypt).toHaveBeenCalledWith('any_value', salt);
  });

  it('Should return a hash on success', async () => {
    const { sut } = makeSut();

    // eslint-disable-next-line
    // @ts-ignore
    vi.mocked(bcrypt).hash.mockResolvedValueOnce('hashed_value');

    const hashedValue = await sut.encrypt('any_value');
    expect(hashedValue).toBe('hashed_value');
  });

  it('Should throw if bcrypt throws', async () => {
    const { sut } = makeSut();

    vi.mocked(bcrypt).hash.mockRejectedValueOnce(new Error());

    const promise = sut.encrypt('any_value');
    await expect(promise).rejects.toThrow();
  });
});
