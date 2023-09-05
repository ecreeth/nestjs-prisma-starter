import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { JWTPayload } from '../../interfaces/req-user-data.interface';

export const ReqUser = createParamDecorator(
  (field: keyof JWTPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user: JWTPayload | undefined = request[REQUEST_USER_KEY];
    return field ? user?.[field] : user;
  },
);
