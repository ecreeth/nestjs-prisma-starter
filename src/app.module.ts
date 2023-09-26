import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from 'nestjs-prisma';
import config from 'src/common/configs/config';
import { IAMModule } from './iam/iam.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    IAMModule,
    UsersModule,
    PrismaModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot({ ttl: 60, limit: 10 }),
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
