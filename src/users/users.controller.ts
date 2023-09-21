import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger';
import { PrismaService } from 'nestjs-prisma';
import { ReqUser } from 'src/iam/authn/decorators/user.decorator';
import { CreateUserDto } from './dto/create-user.dto';
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

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() payload: CreateUserDto) {
    return this.prisma.user.create({ data: payload });
  }

  @Get()
  findAll(
    @Query('query') query: string = '',
    @Query('limit') limit: number,
    @Query('offset') offset: number,
    @Query('orderBy') orderBy: string,
    @Query('sortBy') sortBy: 'asc' | 'desc',
  ) {
    offset = Math.max(0, offset) || 0;
    limit = Math.max(1, Math.min(500, limit)) || 10;

    const _sortBy = sortBy.toLowerCase();
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

    if (!['asc', 'desc'].includes(_sortBy)) {
      sortBy = 'asc';
    }

    return this.prisma.user.findMany({
      where: {
        // TODO: Add any conditions here
      },
      take: limit,
      skip: offset,
      orderBy: {
        [orderBy]: _sortBy,
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
}
