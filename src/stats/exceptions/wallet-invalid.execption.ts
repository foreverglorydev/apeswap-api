import { HttpException, HttpStatus } from '@nestjs/common';

export class WalletInvalidHttpException extends HttpException {
  constructor() {
    super(
      { message: 'Wallet Invalid', error: 'Invalid' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
