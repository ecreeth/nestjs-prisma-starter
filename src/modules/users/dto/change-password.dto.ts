import { IsNotEmpty, Min } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @Min(8)
  oldPassword: string;

  @IsNotEmpty()
  @Min(8)
  newPassword: string;
}
