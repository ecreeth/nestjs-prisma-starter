import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { HashingService } from '../../hashing/hashing.service';
import { UserService } from '../users.service';

const createUserDto = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
} as User;

describe('UsersService', () => {
  let usersService: UserService;
  let prismaService: PrismaService;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, HashingService, PrismaService],
    }).compile();

    usersService = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
    hashingService = module.get<HashingService>(HashingService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const createSpy = jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValueOnce({
          id: '1',
          ...createUserDto,
        });

      const result = await usersService.create(createUserDto);

      expect(createSpy).toHaveBeenCalledWith({ data: createUserDto });
      expect(result).toEqual({ id: '1', ...createUserDto });
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users = [
        {
          id: '1',
          ...createUserDto,
        },
      ];

      const findManySpy = jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValueOnce(users as User[]);

      const result = await usersService.findAll();

      expect(findManySpy).toHaveBeenCalledWith({ take: 1000 });
      expect(result).toEqual(users);
    });
  });

  describe('findOne', () => {
    it('should return a user by options', async () => {
      const options = { where: { id: '1' } };
      const user = {
        id: '1',
        ...createUserDto,
      };

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(user as User);

      const result = await usersService.findOne(options);

      expect(findUniqueSpy).toHaveBeenCalledWith(options);
      expect(result).toEqual(user);
    });
  });

  describe('changePassword', () => {
    it('should change the password for a user', async () => {
      const userId = '1';
      const userPassword = 'currentPassword';
      const changePassword = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };
      const hashedPassword = 'hashedPassword';

      const findUniqueSpy = jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce({ password: userPassword } as User);
      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(true);
      const hashSpy = jest
        .spyOn(hashingService, 'hash')
        .mockResolvedValueOnce(hashedPassword);
      const updateSpy = jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValueOnce({} as User);

      const result = await usersService.changePassword(
        userId,
        userPassword,
        changePassword,
      );

      expect(findUniqueSpy).toHaveBeenCalledWith({ where: { id: userId } });
      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.currentPassword,
        userPassword,
      );
      expect(hashSpy).toHaveBeenCalledWith(changePassword.newPassword);
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: userId },
        data: { password: hashedPassword },
      });
      expect(result).toEqual({});
    });

    it('should throw BadRequestException if the old password is not valid', async () => {
      const userId = '1';
      const userPassword = 'currentPassword';
      const changePassword = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };

      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(false);

      await expect(
        usersService.changePassword(userId, userPassword, changePassword),
      ).rejects.toThrow(BadRequestException);

      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.currentPassword,
        userPassword,
      );
    });

    it('should throw an error if an error occurs during the password change process', async () => {
      const userId = '1';
      const userPassword = 'currentPassword';
      const changePassword = {
        currentPassword: 'currentPassword',
        newPassword: 'newPassword',
      };

      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockRejectedValueOnce(new Error('Compare error'));

      await expect(
        usersService.changePassword(userId, userPassword, changePassword),
      ).rejects.toThrow(Error);

      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.currentPassword,
        userPassword,
      );
    });
  });
});
