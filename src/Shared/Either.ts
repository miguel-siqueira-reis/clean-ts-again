export class Either<L, R> {
  private readonly _value: L | R;
  private readonly _isLeft: boolean;

  private constructor(value: L | R, isLeft?: boolean) {
    this._isLeft = isLeft ?? false;
    this._value = value;
  }

  public static left<L, R>(left: L): Either<L, R> {
    return new Either<L, R>(left, true);
  }

  public static right<L, R>(right: R): Either<L, R> {
    return new Either<L, R>(right);
  }

  public isLeft(): boolean {
    if (this._isLeft) {
      return true;
    }

    return this._value instanceof Error;
  }

  public isRight(): boolean {
    return !this.isLeft();
  }

  public left(): L {
    if (this.isLeft()) {
      return this._value as L;
    } else {
      throw new Error('Can not access the left value of a right Either.');
    }
  }

  public right(): R {
    if (this.isRight()) {
      return this._value as R;
    } else {
      throw new Error('Can not access the right value of a left Either.');
    }
  }
}
