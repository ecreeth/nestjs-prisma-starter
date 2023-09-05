import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import jwtConfig from 'src/common/configs/jwt.config';
import { UserService } from '../users/users.service';
import { ApiKeyService } from './authn/api-keys.service';
import { AuthnController } from './authn/authentication.controller';
import { AuthnService } from './authn/authentication.service';
import { ApiKeyGuard } from './authn/guards/api-key.guard';
import { AuthGuard } from './authn/guards/auth.guard';
import { JwtGuard } from './authn/guards/jwt.guard';
import { OtpService } from './authn/otp/otp.service';
import { GoogleAuthnController } from './authn/social/google/google-authentication.controller';
import { GoogleAuthnService } from './authn/social/google/google-authentication.service';
import { AuthzController } from './authz/authorization.controller';
import { RoleService } from './authz/roles/roles.service';
import { HashingService } from './hashing/hashing.service';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    ApiKeyGuard,
    JwtGuard,
    OtpService,
    UserService,
    AuthnService,
    ApiKeyService,
    HashingService,
    GoogleAuthnService,
    RoleService,
  ],
  exports: [],
  controllers: [AuthnController, AuthzController, GoogleAuthnController],
})
export class IAMModule {}
