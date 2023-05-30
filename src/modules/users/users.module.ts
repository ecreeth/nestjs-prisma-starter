import { Module } from '@nestjs/common';
import { UserService } from './users.service';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [],
  providers: [UserService, PasswordService],
})
export class UsersModule {}
