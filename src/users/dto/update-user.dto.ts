import { OmitType } from '@nestjs/swagger';
import { SignUpDto } from 'src/iam/authn/dto/sign-up.dto';

export class UpdateUserDto extends OmitType(SignUpDto, ['password']) {}
