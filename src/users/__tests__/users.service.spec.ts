import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HashingService } from '../../iam/hashing/hashing.service';
import { UserService } from '../users.service';

const createUserDto = {
  firstName: 'John',
  lastName: ' Doe',
  email: 'john@example.com',
} as User;

describe('UsersService', () => {
  let usersService: UserService;
  let usersRepository: Repository<User>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        HashingService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    usersService = module.get<UserService>(UserService);
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    hashingService = module.get<HashingService>(HashingService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      const saveSpy = jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValueOnce({
          id: '1',
          ...createUserDto,
        });

      const result = await usersService.create(createUserDto);

      expect(saveSpy).toHaveBeenCalledWith(createUserDto);
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

      const findSpy = jest
        .spyOn(usersRepository, 'find')
        .mockResolvedValueOnce(users as User[]);

      const result = await usersService.findAll();

      expect(findSpy).toHaveBeenCalledWith({ take: 1000 });
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

      const findOneSpy = jest
        .spyOn(usersRepository, 'findOne')
        .mockResolvedValueOnce(user);

      const result = await usersService.findOne(options);

      expect(findOneSpy).toHaveBeenCalledWith(options);
      expect(result).toEqual(user);
    });
  });

  describe('changePassword', () => {
    it('should change the password for a user', async () => {
      const userId = '1';
      const userPassword = 'oldPassword';
      const changePassword = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };
      const hashedPassword = 'hashedPassword';

      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(true);
      const hashSpy = jest
        .spyOn(hashingService, 'hash')
        .mockResolvedValueOnce(hashedPassword);
      const updateSpy = jest
        .spyOn(usersRepository, 'update')
        .mockResolvedValueOnce({} as any);

      const result = await usersService.changePassword(
        userId,
        userPassword,
        changePassword,
      );

      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.oldPassword,
        userPassword,
      );
      expect(hashSpy).toHaveBeenCalledWith(changePassword.newPassword);
      expect(updateSpy).toHaveBeenCalledWith(userId, {
        password: hashedPassword,
      });
      expect(result).toEqual({});
    });

    it('should throw BadRequestException if the old password is not valid', async () => {
      const userId = '1';
      const userPassword = 'oldPassword';
      const changePassword = {
        oldPassword: 'wrongPassword',
        newPassword: 'newPassword',
      };

      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockResolvedValueOnce(false);

      await expect(
        usersService.changePassword(userId, userPassword, changePassword),
      ).rejects.toThrow(BadRequestException);

      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.oldPassword,
        userPassword,
      );
    });

    it('should throw an error if an error occurs during the password change process', async () => {
      const userId = '1';
      const userPassword = 'oldPassword';
      const changePassword = {
        oldPassword: 'oldPassword',
        newPassword: 'newPassword',
      };

      const compareSpy = jest
        .spyOn(hashingService, 'compare')
        .mockRejectedValueOnce(new Error('Compare error'));

      await expect(
        usersService.changePassword(userId, userPassword, changePassword),
      ).rejects.toThrow(Error);

      expect(compareSpy).toHaveBeenCalledWith(
        changePassword.oldPassword,
        userPassword,
      );
    });
  });
});
