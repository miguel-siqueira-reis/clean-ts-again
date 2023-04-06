import { AddAccount } from '../../Domain/use-cases/add-account';
import { BadRequest, Ok, ServerError } from '../helpers/http';
import { Controller } from '../protocols/controllers';
import { Validation } from '../protocols/validation';

export class SignupController implements Controller {
  constructor(
    private signupValidation: Validation<SignupController.Request, string>,
    private addAccount: AddAccount,
  ) {}

  async handle(request: Controller.Request): Controller.Response {
    try {
      const data = request.body as SignupController.Request;

      const error = this.signupValidation.validate(data);
      if (error.isLeft()) {
        return BadRequest(new Error(error.left()));
      }

      const account = await this.addAccount.add({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      if (account.isLeft()) {
        return BadRequest(account.left());
      }

      return Ok(account.right());
    } catch (error: any) {
      return ServerError(error);
    }
  }
}

export namespace SignupController {
  export type Request = {
    name: string;
    email: string;
    password: string;
    passwordConfirmation: string;
  };
}
