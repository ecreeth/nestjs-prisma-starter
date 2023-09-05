import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from 'nestjs-prisma';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { JWTPayload } from '../../interfaces/req-user-data.interface';
import { ApiKeyService } from '../api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private apiKeyService: ApiKeyService,
    private prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const apiKey = this.extractKeyFromHeader(request);
    if (!apiKey) {
      throw new UnauthorizedException();
    }
    const uuid = this.apiKeyService.extractIdFromApiKey(apiKey);
    try {
      const apiKeyModel = await this.prisma.apiKey.findFirst({
        where: { uuid },
        include: {
          user: true,
        },
      });
      await this.apiKeyService.validate(apiKey, apiKeyModel.key);
      request[REQUEST_USER_KEY] = {
        sub: apiKeyModel.user.id,
        email: apiKeyModel.user.email,
      } as JWTPayload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractKeyFromHeader(request: Request): string | undefined {
    const [type, key] = request.headers.authorization?.split(' ') ?? [];
    return type === 'ApiKey' ? key : undefined;
  }
}
