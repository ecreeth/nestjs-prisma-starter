import { InjectQueue } from '@nestjs/bull';
import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiParam, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bull';
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
    // @InjectQueue('greetings') private greetingsQueue: Queue,
  ) {}

  @Get('/say-hello')
  async sayHello() {
    // await this.greetingsQueue.add('greet', 'Luis M.');
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  create(@Body() createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto });
  }

  @Get()
  findAll(
    @Query('query') query: string = '',
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('orderBy') orderBy: string = 'createdAt',
    @Query('sortBy') sortBy: 'asc' | 'desc' = 'asc',
  ) {
    offset = Math.max(0, offset) || 0;
    limit = Math.max(1, Math.min(500, limit)) || 10;

    const allowedOrderBys = [
      'id',
      'email',
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
      },
      take: limit,
      skip: offset,
      orderBy: {
        [orderBy]: sortBy,
      },
    });
  }

  @Get(':id')
  @ApiParam({ name: 'id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id')
  @ApiParam({ name: 'id' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiParam({ name: 'id' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Get('count')
  count() {
    return this.usersService.count();
  }

  @Get('me')
  me(@ReqUser() user) {
    return user;
  }

  @Get(':id/verify-password')
  verifyPassword(@Param('id') id: string, @Body() payload: VerifyPassword) {
    // TODO:
  }

  @Post(':id/profile-image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  setProfileImage(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1000 }),
          new FileTypeValidator({
            fileType: 'image/(jpeg|png)',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
  }
}
