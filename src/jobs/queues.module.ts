import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { GreetingsProcessor } from './greetings.processor';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'greetings',
    }),
  ],
  exports: [],
  providers: [GreetingsProcessor],
})
export class QueueModule {}
