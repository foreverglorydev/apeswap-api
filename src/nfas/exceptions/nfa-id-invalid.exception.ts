import { HttpException, HttpStatus } from '@nestjs/common';

export class NfaIdInvalidHttpException extends HttpException {
  constructor() {
    super(
      { message: 'Nfa Id Invalid', error: 'Invalid' },
      HttpStatus.BAD_REQUEST,
    );
  }
}
