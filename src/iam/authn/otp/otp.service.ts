import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'nestjs-prisma';
import { authenticator } from 'otplib';

@Injectable()
export class OtpService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async generateSecret(email: string) {
    const secret = authenticator.generateSecret();
    const appName = this.configService.getOrThrow('TFA_APP_NAME');
    const uri = authenticator.keyuri(email, appName, secret);
    return {
      uri,
      secret,
    };
  }

  verifyCode(code: string, secret: string) {
    return authenticator.verify({
      token: code,
      secret,
    });
  }

  async enableTfaForUser(email: string, secret: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        // TIP: ideally, we would want to encrypt the "secret" instead of storing it in a plaintext.
        // Note - we coludn't use hashing here as the origin secret is required to verify the user's provided code
        twoFactorSecret: secret,
        twoFactorEnabled: true,
      },
    });
  }
}
