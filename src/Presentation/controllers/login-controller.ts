import { LoginAuth } from '@/Domain/use-cases/auth/login-auth';
import { BadRequest, Ok, ServerError } from '../helpers/http';
import { Controller } from '../protocols/controllers';
import { Validation } from '../protocols/validation';

export class LoginController implements Controller {
  constructor(
    private validation: Validation<LoginController.Request, string>,
    private loginAuth: LoginAuth,
  ) {}

  async handle(request: Controller.Request): Controller.Response {
    try {
      const data = request.body as LoginController.Request;

      const error = this.validation.validate(data);
      if (error.isLeft()) {
        return BadRequest(new Error(error.left()));
      }

      const authData = await this.loginAuth.login(data);
      if (authData.isLeft()) {
        return BadRequest(authData.left());
      }

      return Ok(authData.right());
    } catch (e: any) {
      return ServerError(e as Error);
    }
  }
}

export namespace LoginController {
  export type Request = {
    email: string;
    password: string;
  };
}
