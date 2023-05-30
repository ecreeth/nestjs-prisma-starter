import { IsNotEmpty } from 'class-validator';

export class CreatePostInput {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  title: string;
}
