import { Body, Controller, Get, Post } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller()
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get('/posts')
    async getPosts(): Promise<any> {
        return this.postService.getPosts();
    }

    @Post('/posts')
    createPost(@Body() createPostDto: CreatePostDto ) {
        return this.postService.createPost(createPostDto);
    }
}
