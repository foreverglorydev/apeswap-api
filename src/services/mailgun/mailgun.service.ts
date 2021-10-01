import { Inject, Injectable } from '@nestjs/common';
import { EmailOptions } from '@nextnm/nestjs-mailgun';
import { Mailgun } from './mailgun.provider';

@Injectable()
export class MailgunService {
  private mail: any;
  constructor(
    @Inject(Mailgun)
    private mailgun,
  ) {}

  async notifyByEmail(data) {
    this.mail = new this.mailgun({
      DOMAIN: process.env.MAILGUN_DOMAIN,
      API_KEY: process.env.MAILGUN_API_KEY,
      HOST: process.env.MAILGUN_HOST,
    });
    try {
      console.log('sending email');
      const options: EmailOptions = {
        from: 'no-reply@apeswap-test.finance',
        to: 'casor06@gmail.com',
        subject: 'New iazo',
        template: 'iazo',
        'h:X-Mailgun-Variables': JSON.stringify(data),
      };
      await this.mail.sendEmail(options);

      console.log('send email success');
    } catch (error) {
      console.log(error);
    }
  }
}
