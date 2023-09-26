import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { NodemailerService } from './providers/nodemailer.service';

@Module({
  providers: [
    {
      provide: MailService,
      useClass: NodemailerService,
    },
  ],
})
export class MailModule {}
