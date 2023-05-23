import { IsNotEmpty, Min } from 'class-validator';

export class ChangePasswordInput {
  @IsNotEmpty()
  @Min(8)
  oldPassword: string;

  @IsNotEmpty()
  @Min(8)
  newPassword: string;
}
