import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class MailService {
  abstract send(to: string, subject: string, html: string): Promise<string>;
}
