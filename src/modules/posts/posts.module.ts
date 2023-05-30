import { Module } from '@nestjs/common';
import { PostService } from './posts.service';

@Module({
  imports: [],
  providers: [PostService],
})
export class PostsModule {}
