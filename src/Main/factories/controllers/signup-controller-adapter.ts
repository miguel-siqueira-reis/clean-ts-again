import { DbAddAccount } from "@/Data/use-cases/add-account";
import { BcryptAdapter } from "@/Infra/cryptography/bcrypt-adatper";
import { UserRepsoitory } from "@/Infra/repositories/mongo-db/user-repository";
import { SignupValidation } from "@/Main/validations/signup-validation";
import { SignupController } from "@/Presentation/controllers/signup-controller";
import { Controller } from "@/Presentation/protocols/controllers";

export const makeSignUpController = (): Controller => {
  const salt = 12;
  const bcryptAdapter = new BcryptAdapter(salt);
  const addAccountRepository = new UserRepsoitory();
  const addAccount = new DbAddAccount(addAccountRepository, addAccountRepository, bcryptAdapter);
  const validationSignUp = new SignupValidation();

  const signUpController = new SignupController(validationSignUp, addAccount);
  return signUpController;
} 