import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsNotEmpty()
  @ApiProperty()
  token: string;

  @Length(8, 50)
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
