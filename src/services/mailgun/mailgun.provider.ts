import { Provider } from '@nestjs/common';
import { MailgunService as MailgunLib } from '@nextnm/nestjs-mailgun';
export const Mailgun = 'lib:mailgun';

export const MailgunProvider: Provider = {
  provide: Mailgun,
  useValue: MailgunLib,
};
