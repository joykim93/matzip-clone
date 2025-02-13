import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from './post.entity';

@Controller()
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get('/markers')
    getAllMarkers() {
        return this.postService.getAllMarkers();
    }

    @Get('/posts')
    async getPosts(@Query('page') page: number): Promise<PostEntity[]> {
        return this.postService.getPosts(page);
    }

    @Get('/posts/:id')
    async getPostById(@Param('id', ParseIntPipe) id: number) {
        return this.postService.getPostById(id);
    }

    @Post('/posts')
    createPost(@Body() createPostDto: CreatePostDto ) {
        return this.postService.createPost(createPostDto);
    }

    @Delete('/posts/:id') 
    deletePost(@Param('id', ParseIntPipe) id: number) {
        return this.postService.deletePost(id);
    }

    @Patch('/posts/:id')
    updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: Omit<CreatePostDto, 'latitude' | 'longitude' | 'address'>,
    ) {
        return this.postService.updatePost(id, updatePostDto)
    }
}
