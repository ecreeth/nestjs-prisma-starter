import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { HashingService } from '../../../hashing/hashing.service';
import { AuthnService } from '../authentication.service';
import { OtpService } from '../otp/otp.service';

const jwtConfiguration = {
  issuer: 'issuer',
  secret: 'secret',
  audience: 'audience',
};

describe('AuthnService', () => {
  let authnService: AuthnService;
  let hashingService: HashingService;
  let usersRepository: Repository<User>;
  let otpService: OtpService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthnService,
        HashingService,
        OtpService,
        JwtService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    authnService = module.get<AuthnService>(AuthnService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingService>(HashingService);
    otpService = module.get<OtpService>(OtpService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('checkUserCredentials', () => {
    it('should return a user if the credentials are valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await hashingService.hash('password'),
        twoFactorSecret: 'abc123',
        isTwoFactorEnabled: false,
      } as User;

      const findOneSpy = jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(user);
      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(true);

      const result = await authnService.checkUserCredentials(email, password);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email },
        select: [
          'id',
          'email',
          'lastName',
          'firstName',
          'password',
          'twoFactorSecret',
          'isTwoFactorEnabled',
        ],
      });
      expect(compareSpy).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual(user);
      expect(result.password).toBeUndefined();
    });

    it('should return null if the user is not found', async () => {
      const email = 'test@example.com';
      const password = 'password';

      const findOneSpy = jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(null);

      const result = await authnService.checkUserCredentials(email, password);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email },
        select: [
          'id',
          'email',
          'lastName',
          'firstName',
          'password',
          'twoFactorSecret',
          'isTwoFactorEnabled',
        ],
      });
      expect(result).toBeNull();
    });

    it('should return null if the password is incorrect', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await hashingService.hash('wrongpassword'),
        twoFactorSecret: 'abc123',
        isTwoFactorEnabled: false,
      } as User;

      const findOneSpy = jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(user);
      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(false);

      const result = await authnService.checkUserCredentials(email, password);

      expect(findOneSpy).toHaveBeenCalledWith({
        where: { email },
        select: [
          'id',
          'email',
          'lastName',
          'firstName',
          'password',
          'twoFactorSecret',
          'isTwoFactorEnabled',
        ],
      });
      expect(compareSpy).toHaveBeenCalledWith(password, user.password);
      expect(result).toBeNull();
    });
  });

  describe('signIn', () => {
    it('should sign in a user with valid credentials', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'password',
        tfaCode: '123456',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await hashingService.hash('password'),
        twoFactorSecret: 'abc123',
        isTwoFactorEnabled: true,
      } as User;

      const checkUserCredentialsSpy = jest
        .spyOn(authnService, 'checkUserCredentials')
        .mockResolvedValueOnce(user);
      const verifyCodeSpy = jest
        .spyOn(otpService, 'verifyCode')
        .mockReturnValueOnce(true);
      const generateTokensSpy = jest
        .spyOn(authnService, 'generateTokens')
        .mockResolvedValueOnce({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        });

      const result = await authnService.signIn(signInDto);

      expect(checkUserCredentialsSpy).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(verifyCodeSpy).toHaveBeenCalledWith(
        signInDto.tfaCode,
        user.twoFactorSecret,
      );
      expect(generateTokensSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });

    it('should throw BadRequestException if the credentials are invalid', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'password',
        tfaCode: '123456',
      };

      const checkUserCredentialsSpy = jest
        .spyOn(authnService, 'checkUserCredentials')
        .mockResolvedValueOnce(null);

      await expect(authnService.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(checkUserCredentialsSpy).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
    });

    it('should throw BadRequestException if the 2FA code is invalid', async () => {
      const signInDto = {
        email: 'test@example.com',
        password: 'password',
        tfaCode: '123456',
      };
      const user = {
        id: '1',
        email: 'test@example.com',
        password: await hashingService.hash('password'),
        twoFactorSecret: 'abc123',
        isTwoFactorEnabled: true,
      } as User;

      const checkUserCredentialsSpy = jest
        .spyOn(authnService, 'checkUserCredentials')
        .mockResolvedValueOnce(user);
      const verifyCodeSpy = jest
        .spyOn(otpService, 'verifyCode')
        .mockReturnValueOnce(false);

      await expect(authnService.signIn(signInDto)).rejects.toThrow(
        BadRequestException,
      );

      expect(checkUserCredentialsSpy).toHaveBeenCalledWith(
        signInDto.email,
        signInDto.password,
      );
      expect(verifyCodeSpy).toHaveBeenCalledWith(
        signInDto.tfaCode,
        user.twoFactorSecret,
      );
    });
  });

  describe('signUp', () => {
    it('should sign up a new user', async () => {
      const signUpDto = {
        email: 'test@example.com',
        password: 'password',
        firstName: 'John',
        lastName: 'Doe',
      };
      const hashedPassword = await hashingService.hash(signUpDto.password);
      const createdUser = {
        id: '1',
        email: signUpDto.email,
        password: hashedPassword,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
      } as User;
      const generateTokensSpy = jest
        .spyOn(authnService, 'generateTokens')
        .mockResolvedValueOnce({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        });

      const createSpy = jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce(createdUser);

      const result = await authnService.signUp(signUpDto);

      expect(createSpy).toHaveBeenCalledWith({
        email: signUpDto.email,
        password: hashedPassword,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
      });
      expect(generateTokensSpy).toHaveBeenCalledWith(createdUser);
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });
  });

  describe('generateTokens', () => {
    it('should generate tokens for a user', async () => {
      const user = {
        id: '1',
        email: 'test@example.com',
      } as User;
      const accessTokenTtl = 3600;
      const refreshTokenTtl = 86400;
      const jwtServiceSignAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('access_token');
      const jwtServiceSignAsyncMock = jest
        .spyOn(jwtService, 'signAsync')
        .mockImplementation(async () => 'refresh_token');

      const { accessToken, refreshToken } = await authnService.generateTokens(
        user,
      );

      expect(jwtServiceSignAsyncSpy).toHaveBeenCalledWith(
        { sub: user.id, email: user.email },
        expect.objectContaining({
          expiresIn: accessTokenTtl,
        }),
      );
      expect(jwtServiceSignAsyncMock).toHaveBeenCalledWith(
        { sub: user.id },
        expect.objectContaining({
          expiresIn: refreshTokenTtl,
        }),
      );
      expect(accessToken).toBe('access_token');
      expect(refreshToken).toBe('refresh_token');
    });
  });

  describe('signToken', () => {
    it('should sign a token', async () => {
      const userId = '1';
      const expiresIn = 3600;
      const payload = { email: 'test@example.com' };
      const signAsyncSpy = jest
        .spyOn(jwtService, 'signAsync')
        .mockResolvedValueOnce('signed_token');

      const result = await authnService['signToken'](
        userId,
        expiresIn,
        payload,
      );

      expect(signAsyncSpy).toHaveBeenCalledWith(
        { sub: userId, ...payload },
        {
          issuer: jwtConfiguration.issuer,
          secret: jwtConfiguration.secret,
          audience: jwtConfiguration.audience,
          expiresIn,
        },
      );
      expect(result).toBe('signed_token');
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens for a user with a valid refresh token', async () => {
      const payload = {
        refreshToken: 'refresh_token',
      };
      const sub = '1';
      const user = {
        id: '1',
        email: 'test@example.com',
      } as User;
      const verifyAsyncSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce({ sub });
      const findOneByOrFailSpy = jest
        .spyOn(usersRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(user);
      const generateTokensSpy = jest
        .spyOn(authnService, 'generateTokens')
        .mockResolvedValueOnce({
          accessToken: 'access_token',
          refreshToken: 'refresh_token',
        });

      const result = await authnService.refreshTokens(payload);

      expect(verifyAsyncSpy).toHaveBeenCalledWith(payload.refreshToken, {
        secret: jwtConfiguration.secret,
        issuer: jwtConfiguration.issuer,
        audience: jwtConfiguration.audience,
      });
      expect(findOneByOrFailSpy).toHaveBeenCalledWith({ id: sub });
      expect(generateTokensSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual({
        accessToken: 'access_token',
        refreshToken: 'refresh_token',
      });
    });

    it('should throw UnauthorizedException if the refresh token is invalid', async () => {
      const payload = {
        refreshToken: 'refresh_token',
      };
      const verifyAsyncSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockRejectedValueOnce(new Error('Invalid token'));

      await expect(authnService.refreshTokens(payload)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(verifyAsyncSpy).toHaveBeenCalledWith(payload.refreshToken, {
        secret: jwtConfiguration.secret,
        issuer: jwtConfiguration.issuer,
        audience: jwtConfiguration.audience,
      });
    });

    it('should throw UnauthorizedException if the user is not found', async () => {
      const payload = {
        refreshToken: 'refresh_token',
      };
      const sub = '1';
      const verifyAsyncSpy = jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce({ sub });
      const findOneByOrFailSpy = jest
        .spyOn(usersRepository, 'findOneByOrFail')
        .mockRejectedValueOnce(new Error('User not found'));

      await expect(authnService.refreshTokens(payload)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(verifyAsyncSpy).toHaveBeenCalledWith(payload.refreshToken, {
        secret: jwtConfiguration.secret,
        issuer: jwtConfiguration.issuer,
        audience: jwtConfiguration.audience,
      });
      expect(findOneByOrFailSpy).toHaveBeenCalledWith({ id: sub });
    });
  });
});
