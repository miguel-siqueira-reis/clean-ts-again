import { AddAccount } from '@/Domain/use-cases/add-account';
import { Either } from '../../Shared/Either';
import { Encrypter } from '../protocols/cryptography/encrypter';
import { AddAccountRepository } from '../protocols/repositories/add-account-repository';
import { FindUserByEmailRepository } from '../protocols/repositories/find-user-email-repository';

export class DbAddAccount implements AddAccount {
  constructor(
    private addAccountrepository: AddAccountRepository,
    private findUserByEmailRepository: FindUserByEmailRepository,
    private encrypter: Encrypter,
  ) {}

  async add(user: AddAccount.Params): AddAccount.Result {
    const userExist = await this.findUserByEmailRepository.loadByEmail(user.email);
    if (userExist) {
      return Either.left(new Error('Email já cadastrado'));
    }

    const hashedPassword = await this.encrypter.encrypt(user.password);

    const account = await this.addAccountrepository.add({
      name: user.name,
      email: user.email,
      password: hashedPassword,
    });

    return Either.right({
      id: account.id,
      name: account.name,
      email: account.email,
    });
  }
}
