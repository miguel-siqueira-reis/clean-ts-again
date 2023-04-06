import * as yup from 'yup';
import { SignupController } from '../../Presentation/controllers/signup-controller';
import { Validation } from '../../Presentation/protocols/validation';
import { Either } from '../../Shared/Either';

type Request = SignupController.Request;
type Response = Either<SignupController.Messages, null>;

export class SignupValidation implements Validation<SignupController.Request, SignupController.Messages> {
  validate(input: Request): Response {
    const schema = yup.object({
      name: yup.string().required('O nome é obrigatório'),
      email: yup.string().email('O email é invalido').required('O email é obrigatório'),
      password: yup.string().min(6, 'A senha deve ser maior que 6 letras').required('A senha é obrigatória'),
      passwordConfirmation: yup.string().required('A confirmação de senha é obrigatória').oneOf([yup.ref('password')], 'A confirmação de senha é inválida'),
    });

    try {
      schema.validateSync(input);

      return Either.right(null);
    } catch (error: any) {
      return Either.left(error.errors[0]);
    }
  }
}
