import { Module } from '@nestjs/common';
import { HashingService } from '../iam/hashing/hashing.service';
import { UsersController } from './users.controller';
import { UserService } from './users.service';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [UserService, HashingService],
})
export class UsersModule {}
