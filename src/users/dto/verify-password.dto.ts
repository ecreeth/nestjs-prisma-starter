import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class VerifyPassword {
  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
