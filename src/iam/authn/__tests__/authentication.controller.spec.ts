import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { JWTPayload } from '../../interfaces/req-user-data.interface';
import { AuthnController } from '../authentication.controller';
import { AuthnService } from '../authentication.service';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { SignInDto } from '../dto/sign-in.dto';
import { SignUpDto } from '../dto/sign-up.dto';
import { OtpService } from '../otp/otp.service';

describe('AuthnController', () => {
  let controller: AuthnController;
  let authService: AuthnService;
  let otpService: OtpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthnController],
      providers: [AuthnService, OtpService],
    }).compile();

    controller = module.get<AuthnController>(AuthnController);
    authService = module.get<AuthnService>(AuthnService);
    otpService = module.get<OtpService>(OtpService);
  });

  describe('signUp', () => {
    it('should call authService.signUp with the provided sign up DTO', async () => {
      const signUpDto: SignUpDto = {
        email: 'luis@gmail.com',
        password: 'password123',
        firstName: 'Luis',
        lastName: 'Alvarado',
      };

      const signUpSpy = jest
        .spyOn(authService, 'signUp')
        .mockResolvedValueOnce({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        });

      const result = await controller.signUp(signUpDto);

      expect(signUpSpy).toHaveBeenCalledWith(signUpDto);
      expect(result).toEqual(signUpDto);
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with the provided sign in DTO', async () => {
      const signInDto: SignInDto = {
        email: 'luis@gmail.com',
        password: 'password123',
      };

      const signInSpy = jest
        .spyOn(authService, 'signIn')
        .mockResolvedValueOnce({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        });

      const result = await controller.signIn(signInDto);

      expect(signInSpy).toHaveBeenCalledWith(signInDto);
      expect(result).toEqual(signInDto);
    });
  });

  describe('refreshTokens', () => {
    it('should call authService.refreshTokens with the provided refresh token DTO', async () => {
      const refreshTokenDto: RefreshTokenDto = {
        refreshToken: 'refreshToken',
      };

      const refreshTokensSpy = jest
        .spyOn(authService, 'refreshTokens')
        .mockResolvedValueOnce({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        });

      const result = await controller.refreshTokens(refreshTokenDto);

      expect(refreshTokensSpy).toHaveBeenCalledWith(refreshTokenDto);
      expect(result).toEqual(refreshTokenDto);
    });
  });

  // describe('generateQrCode', () => {
  //   it('should call otpService.generateSecret, otpService.enableTfaForUser, and return a QR code image', async () => {
  //     const user = { email: 'test@example.com' } as JWTPayload;
  //     const responseMock = {
  //       type: jest.fn(),
  //     };

  //     const secret = 'testSecret';
  //     const uri = 'testUri';

  //     const generateSecretSpy = jest
  //       .spyOn(otpService, 'generateSecret')
  //       .mockResolvedValueOnce({ secret, uri });
  //     const enableTfaForUserSpy = jest
  //       .spyOn(otpService, 'enableTfaForUser')
  //       .mockResolvedValueOnce(/* provide the expected result */);

  //     const toFileStreamMock = jest.fn();
  //     jest
  //       .spyOn(controller, 'generateQrCode')
  //       .mockResolvedValueOnce(toFileStreamMock as any as Promise<any>);

  //     const result = await controller.generateQrCode(
  //       user,
  //       responseMock as any as Response
  //     );

  //     expect(generateSecretSpy).toHaveBeenCalledWith(user.email);
  //     expect(enableTfaForUserSpy).toHaveBeenCalledWith(user.email, secret);
  //     expect(responseMock.type).toHaveBeenCalledWith('png');
  //     expect(result).toEqual(toFileStreamMock);
  //   });
  // });
});
