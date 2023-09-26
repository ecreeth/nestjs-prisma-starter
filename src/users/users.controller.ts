import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';
import { ReqUser } from 'src/iam/authn/decorators/user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyPassword } from './dto/verify-password.dto';
import { UserService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private prisma: PrismaService,
    private usersService: UserService,
  ) {}

  @Get()
  findAll(
    @Query('query') query?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('orderBy') orderBy?: string,
    @Query('sortBy') sortBy?: 'asc' | 'desc',
  ) {
    offset = Math.max(0, offset) || 0;
    limit = Math.max(1, Math.min(500, limit)) || 10;

    const allowedOrderBys = [
      'id',
      'email',
      'username',
      'firstName',
      'lastName',
      'createdAt',
    ];

    if (!allowedOrderBys.includes(orderBy)) {
      orderBy = 'createdAt';
    }

    if (!['asc', 'desc'].includes(sortBy)) {
      sortBy = 'asc';
    }

    return this.prisma.user.findMany({
      where: {
        // TODO: Add any conditions here
        deletedAt: {
          equals: null,
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        [orderBy]: sortBy,
      },
    });
  }

  @Get(':user_id')
  @ApiParam({ name: 'user_id' })
  findOne(@Param('user_id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch(':user_id')
  @ApiParam({ name: 'user_id' })
  update(@Param('user_id') userId: string, @Body() payload: UpdateUserDto) {
    return this.usersService.update(userId, payload);
  }

  @Delete(':user_id')
  @ApiParam({ name: 'user_id' })
  remove(@Param('user_id') userId: string) {
    return this.usersService.remove(userId);
  }

  @Get('count')
  count() {
    return this.usersService.count();
  }

  @Get('me')
  me(@ReqUser() user) {
    return user;
  }

  @Get(':user_id/verify-password')
  verifyPassword(
    @Param('user_id') userId: string,
    @Body() payload: VerifyPassword,
  ) {
    return this.usersService.verifyPassword(userId, payload.password);
  }

  @Get(':user_id/change-password')
  changePassword(
    @Param('user_id') userId: string,
    @Body() payload: ChangePasswordDto,
  ) {
    return this.usersService.changePassword(userId, payload);
  }
}
