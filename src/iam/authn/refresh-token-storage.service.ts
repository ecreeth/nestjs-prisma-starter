import {
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { Redis } from 'ioredis';

export class InvalidatedRefreshTokenError extends Error {}

@Injectable()
export class RefreshTokenStorage
  implements OnApplicationBootstrap, OnApplicationShutdown
{
  private redis: Redis;

  onApplicationBootstrap() {
    this.redis = new Redis({
      port: 6379,
      host: 'localhost',
    });
  }

  onApplicationShutdown() {
    return this.redis.quit();
  }

  async insert(userId: string, tokenId: string): Promise<void> {
    await this.redis.set(this.getKey(userId), tokenId);
  }

  async validate(userId: string, tokenId: string): Promise<boolean> {
    const storedId = await this.redis.get(this.getKey(userId));
    if (storedId !== tokenId) {
      throw new InvalidatedRefreshTokenError();
    }
    return true;
  }

  async invalidate(userId: string): Promise<void> {
    await this.redis.del(this.getKey(userId));
  }

  private getKey(userId: string): string {
    return `user-${userId}`;
  }
}
