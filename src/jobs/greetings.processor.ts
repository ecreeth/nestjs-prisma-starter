import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { Job } from 'bull';

@Processor('greetings')
export class GreetingsProcessor {
  private readonly logger = new Logger(GreetingsProcessor.name);

  @Process('greet')
  async handleGreet(job: Job) {
    this.logger.debug('Start greeting...');
    await new Promise((resolve) =>
      setTimeout(() => resolve(`Hello ${job.data}!`), 2000),
    );
    this.logger.debug('Greeting completed');
  }
}
