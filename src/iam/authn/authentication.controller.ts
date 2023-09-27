import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { JWTPayload } from '../interfaces/req-user-data.interface';
import { AuthnService } from './authentication.service';
import { Auth } from './decorators/auth.decorator';
import { ReqUser } from './decorators/user.decorator';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { AuthType } from './enums/auth-type.enum.';
import { OtpService } from './otp/otp.service';

@ApiTags('auth')
@Controller('auth')
export class AuthnController {
  constructor(
    private authnService: AuthnService,
    private otpService: OtpService,
  ) {}

  @Post('sign-up')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.CREATED)
  @ApiBody({ type: SignUpDto })
  signUp(@Body() payload: SignUpDto) {
    return this.authnService.signUp(payload);
  }

  @Post('sign-in')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: SignInDto })
  signIn(@Body() payload: SignInDto) {
    return this.authnService.signIn(payload);
  }

  @Post('reset-password')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() payload: ResetPasswordDto) {
    return this.authnService.resetPassword(payload);
  }

  @Post('forgot-password')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: ForgotPasswordDto })
  forgotPassword(@Body() payload: ForgotPasswordDto) {
    return this.authnService.forgotPassword(payload);
  }

  @Post('refresh-tokens')
  @Auth(AuthType.None)
  @HttpCode(HttpStatus.OK)
  @ApiBody({ type: RefreshTokenDto })
  refreshTokens(@Body() payload: RefreshTokenDto) {
    return this.authnService.refreshTokens(payload);
  }

  @Post('2fa/generate')
  @HttpCode(HttpStatus.OK)
  async generateQrCode(@ReqUser() user: JWTPayload, @Res() response: Response) {
    const { secret, uri } = await this.otpService.generateSecret(user.email);
    await this.otpService.enableTfaForUser(user.email, secret);
    response.type('png');
    return toFileStream(response, uri);
  }
}
