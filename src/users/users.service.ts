import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { HashingService } from '../iam/hashing/hashing.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
  ) {}

  create(createUserDto: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data: createUserDto });
  }

  findAll(): Promise<User[]> {
    return this.prisma.user.findMany({ take: 1000 });
  }

  findOne(options: Prisma.UserFindUniqueArgs): Promise<User> {
    return this.prisma.user.findUnique(options);
  }

  findById(id: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findOneByOrFail(options: Prisma.UserFindFirstArgs): Promise<User> {
    return this.prisma.user.findFirst(options);
  }

  findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  update(id: string, updateUserDto: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  count(): Promise<number> {
    return this.prisma.user.count();
  }

  async changePassword(
    userId: string,
    userPassword: string,
    changePassword: ChangePasswordDto,
  ) {
    const isPasswordValid = await this.hashingService.compare(
      changePassword.oldPassword,
      userPassword,
    );

    if (!isPasswordValid) {
      throw new BadRequestException(
        'Old password is not valid. Please try again.',
      );
    }

    const hashedPassword = await this.hashingService.hash(
      changePassword.newPassword,
    );

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });
  }
}
