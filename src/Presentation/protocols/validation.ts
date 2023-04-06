import { Either } from '../../Shared/Either';

export interface Validation<I, O> {
  validate(input: Validation.Input<I>): Validation.Output<O>;
}

export namespace Validation {
  export type Input<I> = I;
  export type Output<O> = Either<O, null>;
}
