import { GenerateToken } from '@/Data/protocols/auth/generate-token';
import { SaveTokenRepository } from '@/Data/protocols/auth/save-token-repository';
import { HashCompare } from '@/Data/protocols/cryptography/hash-compare';
import { FindUserByEmailRepository } from '@/Data/protocols/repositories/find-user-email-repository';
import { LoginAuth } from '@/Domain/use-cases/auth/login-auth';
import { Either } from '@/Shared/Either';

export class Auth implements LoginAuth {
  constructor(
    private findUserByEmailRepository: FindUserByEmailRepository,
    private hashCompare: HashCompare,
    private generateToken: GenerateToken,
    private saveTokenRepository: SaveTokenRepository,
  ) {}

  async login(credentials: LoginAuth.Request): LoginAuth.Response {
    const user = await this.findUserByEmailRepository.loadByEmail(credentials.email);
    if (!user) {
      return Either.left(new Error('Usuário não encontrado'));
    }

    const isValidPassword = await this.hashCompare.compare(credentials.password, user.password);
    if (!isValidPassword) {
      return Either.left(new Error('Senha inválida'));
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
    };

    const tokenOptions = {
      id: user.id,
      model: 'user',
      ability: ['*'],
    };

    const token = await this.generateToken.generate(userData);

    await this.saveTokenRepository.saveToken(token, tokenOptions);

    return Either.right({
      user: userData,
      token,
    });
  }
}
