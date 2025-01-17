import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import jwtConfig from 'src/common/configs/jwt.config';
import { HashingService } from '../hashing/hashing.service';
import { JWTPayload } from '../interfaces/req-user-data.interface';
import { Token } from '../interfaces/token.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { OtpService } from './otp/otp.service';

@Injectable()
export class AuthnService {
  constructor(
    private jwtService: JwtService,
    private otpService: OtpService,
    private hashingService: HashingService,
    private prisma: PrismaService,
    @Inject(jwtConfig.KEY)
    private jwtConfiguration: ConfigType<typeof jwtConfig>,
  ) {}

  /**
   * Validates a user's email and password
   * @param {string} email - The user's email
   * @param {string} password - The user's password
   * @returns {Promise<User | null>} - A Promise that resolves to a User object if the user is valid, or null if the user is not found or the password is incorrect
   */
  async checkUserCredentials(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        password: true,
        twoFactorSecret: true,
        twoFactorEnabled: true,
      },
    });

    if (user) {
      const isValidPassword = await this.hashingService.compare(
        password,
        user.password,
      );

      if (isValidPassword) {
        user.password = undefined;
        return user as User;
      }
    }

    return null;
  }

  /**
   * Signs in a user
   * @param {SignInDto} payload - The sign-in data
   * @returns {Promise<Token>} - A Promise that resolves to a Token object
   */
  async signIn(payload: SignInDto): Promise<Token> {
    const user = await this.checkUserCredentials(
      payload.email,
      payload.password,
    );

    if (!user) {
      throw new BadRequestException(
        'These credentials do not match our records',
      );
    }

    if (user.twoFactorEnabled) {
      const isValidTfaCode = this.otpService.verifyCode(
        payload.tfaCode,
        user.twoFactorSecret,
      );
      if (!isValidTfaCode) {
        throw new BadRequestException('Invalid 2FA code');
      }
    }

    return await this.generateTokens(user);
  }

  /**
   * Signs up a new user
   * @param {SignUpDto} payload - The sign-up data
   * @returns {Promise<Token>} - A Promise that resolves to a Token object
   */
  async signUp(payload: SignUpDto): Promise<Token> {
    const hashedPassword = await this.hashingService.hash(payload.password);
    const user = await this.prisma.user.create({
      data: {
        email: payload.email,
        username: payload.username,
        password: hashedPassword,
        lastName: payload.lastName,
        firstName: payload.firstName,
      },
    });
    return await this.generateTokens(user);
  }

  /**
   * Generates tokens for a user
   * @param {User} user - The user for whom the tokens are generated
   * @returns {Promise<Token>} - A Promise that resolves to a Token object
   */
  async generateTokens(user: User): Promise<Token> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken(user.id, this.jwtConfiguration.accessTokenTtl, {
        email: user.email,
      }),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Signs a token
   * @private
   * @param {string} userId - The user ID
   * @param {number} expiresIn - The expiration time in seconds
   * @param {T} [payload] - The payload to include in the token (optional)
   * @returns {Promise<string>} - A Promise that resolves to a string representing the signed token
   */
  private async signToken<T>(
    userId: string,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        expiresIn,
      },
    );
  }

  /**
   * Refreshes tokens for a user
   * @param {RefreshTokenDto} payload - The refresh token data
   * @returns {Promise<Token>} - A Promise that resolves to a Token object
   */
  async refreshTokens(payload: RefreshTokenDto): Promise<Token> {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<JWTPayload, 'sub'>
      >(payload.refreshToken, {
        secret: this.jwtConfiguration.secret,
        issuer: this.jwtConfiguration.issuer,
        audience: this.jwtConfiguration.audience,
      });
      const user = await this.prisma.user.findFirst({
        where: {
          id: sub,
        },
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException();
    }
  }

  // TODO:
  async resetPassword(payload: ResetPasswordDto) {
    const passwordReset = await this.prisma.passwordReset.findUnique({
      where: { token: payload.token },
    });

    if (!passwordReset) {
      throw new BadRequestException('Invalid password reset token.');
    }

    if (passwordReset.expiresAt < new Date()) {
      throw new BadRequestException('Password reset token has expired.');
    }

    const hashedPassword = await this.hashingService.hash(payload.password);

    return await this.prisma.$transaction([
      this.prisma.user.update({
        where: { email: passwordReset.email },
        data: {
          password: hashedPassword,
        },
      }),
      this.prisma.passwordReset.delete({
        where: { token: payload.token },
      }),
    ]);
  }

  // TODO:
  async forgotPassword({ email }: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestException(
        `We can't find a user with that e-mail address`,
      );
    }

    // TODO:
    const resetToken = 'generateToken()';

    await this.prisma.passwordReset.create({
      data: {
        email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // Expires in 1 hour
      },
    });

    // await sendPasswordResetEmail(email, encodeURIComponent(resetToken));
  }
}
