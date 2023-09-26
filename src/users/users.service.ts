import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { HashingService } from '../hashing/hashing.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private hashingService: HashingService,
  ) {}

  create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
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
    return this.prisma.user.findFirstOrThrow(options);
  }

  findByEmail(email: string): Promise<User> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  remove(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async count() {
    return {
      count: await this.prisma.user.count(),
    };
  }

  async verifyPassword(userId: string, password: string) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: { password: true },
    });

    const isPasswordValid = await this.hashingService.compare(
      user.password,
      password,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException(
        'The provided password was incorrect.',
      );
    }

    return {
      verified: true,
    };
  }

  async changePassword(userId: string, payload: ChangePasswordDto) {
    const user = await this.prisma.user.findFirstOrThrow({
      where: { id: userId },
      select: { password: true },
    });

    const isPasswordValid = await this.hashingService.compare(
      user.password,
      payload.currentPassword,
    );

    if (!isPasswordValid) {
      throw new UnprocessableEntityException(
        'Old password is not valid. Please try again.',
      );
    }

    const hashedPassword = await this.hashingService.hash(payload.newPassword);

    return await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }
}
