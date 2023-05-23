import { Body, Query } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { UserIdArgs } from './args/user-id.args';
import { CreatePostInput } from './dto/createPost.input';

export class PostService {
  constructor(private prisma: PrismaService) {}

  async createPost(@Body('data') data: CreatePostInput) {
    const newPost = this.prisma.post.create({
      data: {
        published: true,
        title: data.title,
        content: data.content,
        // authorId: 0, TODO:
      },
    });
    return newPost;
  }

  async getFilteredPosts(
    @Query('take') take?: number,
    @Query('skip') skip?: number,
    @Query('searchString') searchString?: string,
    @Query('orderBy') orderBy?: 'asc' | 'desc'
  ): Promise<Post[]> {
    const or = searchString
      ? {
          OR: [
            { title: { contains: searchString } },
            { content: { contains: searchString } },
          ],
        }
      : {};

    return this.prisma.post.findMany({
      where: {
        published: true,
        ...or,
      },
      include: { author: true },
      take: Number(take) || undefined,
      skip: Number(skip) || undefined,
      orderBy: {
        updatedAt: orderBy,
      },
    });
  }

  userPosts(@Query() id: UserIdArgs) {
    return this.prisma.post.findMany({
      where: {
        published: true,
        author: { id: id.userId },
      },
    });
  }
}
