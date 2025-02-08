import { Controller, Get } from '@nestjs/common';
import { PostService } from './post.service';

@Controller()
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get('/posts')
    async getPosts(): Promise<any> {
        return this.postService.getPosts();
    }
}
