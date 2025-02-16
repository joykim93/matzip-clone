import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { Post as PostEntity } from './post.entity';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/@common/decorators/get-user.decorators';
import { User } from 'src/auth/user.entity';

@Controller()
@UseGuards(AuthGuard())
export class PostController {
    constructor(private readonly postService: PostService) {}

    @Get('/markers/my')
    getAllMarkers(
        @GetUser() user: User
    ) {
        return this.postService.getAllMarkers(user);
    }

    @Get('/posts/my')
    async getPosts(
        @Query('page') page: number,
        @GetUser() user: User
    ): Promise<PostEntity[]> {
        return this.postService.getPosts(page, user);
    }

    @Get('/posts/:id')
    async getPostById(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        return this.postService.getPostById(id, user);
    }

    @Post('/posts')
    createPost(
        @Body() createPostDto: CreatePostDto,
        @GetUser() user: User
    ) {
        return this.postService.createPost(createPostDto, user);
    }

    @Delete('/posts/:id') 
    deletePost(
        @Param('id', ParseIntPipe) id: number,
        @GetUser() user: User
    ) {
        return this.postService.deletePost(id, user);
    }

    @Patch('/posts/:id')
    updatePost(
        @Param('id', ParseIntPipe) id: number,
        @Body() updatePostDto: Omit<CreatePostDto, 'latitude' | 'longitude' | 'address'>,
        @GetUser() user: User
    ) {
        return this.postService.updatePost(id, updatePostDto, user)
    }
}
