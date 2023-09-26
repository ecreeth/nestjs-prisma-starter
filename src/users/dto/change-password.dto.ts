import { IsNotEmpty, Length } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  @Length(8, 50)
  currentPassword: string;

  @IsNotEmpty()
  @Length(8, 50)
  newPassword: string;
}
