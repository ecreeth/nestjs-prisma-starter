import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from 'nestjs-prisma';
import { IAMModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    IAMModule,
    UsersModule,
    PrismaModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 10 }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
