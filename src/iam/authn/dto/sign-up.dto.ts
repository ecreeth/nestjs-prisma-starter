import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { capitalize, lowerCase } from 'src/utils/index.utils';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 100)
  @ApiProperty()
  @Transform(capitalize)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  @Length(3, 100)
  @Transform(capitalize)
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  @Transform(lowerCase)
  email: string;

  @IsOptional()
  @ApiProperty()
  @Length(3, 25)
  @Transform(lowerCase)
  username?: string;

  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  @Length(8, 50)
  password: string;
}
