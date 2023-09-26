import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
} from 'class-validator';
import { lowerCase } from 'src/utils/index.utils';

export class SignInDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(lowerCase)
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @ApiProperty()
  @IsNumberString()
  tfaCode?: string;
}
