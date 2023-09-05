import { ApiProperty } from '@nestjs/swagger';

export class VerifyPassword {
  @ApiProperty()
  password: string;
}
