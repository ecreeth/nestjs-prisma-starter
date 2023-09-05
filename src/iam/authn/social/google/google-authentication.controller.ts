import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from '../../decorators/auth.decorator';
import { GoogleTokenDto } from '../../dto/google-token.dto';
import { AuthType } from '../../enums/auth-type.enum.';
import { GoogleAuthnService } from './google-authentication.service';

@ApiTags('auth')
@Auth(AuthType.None)
@Controller('auth/google')
export class GoogleAuthnController {
  constructor(private googleAuthnService: GoogleAuthnService) {}

  @Post()
  authenticate(@Body() tokenDto: GoogleTokenDto) {
    return this.googleAuthnService.authenticate(tokenDto.token);
  }
}
