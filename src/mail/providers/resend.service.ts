import { Injectable } from '@nestjs/common';
import { MailService } from '../mail.service';

@Injectable()
export class ResendService implements MailService {
  send(to: string, subject: string, html: string): Promise<string> {
    throw new Error('Method not implemented.');
  }
}
