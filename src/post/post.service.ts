import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostService {

    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
    ){}

    getPosts(): any {
        return ['a게시글', 'b게시글'];
    }

    async createPost(createPostDto: CreatePostDto) {
        const {
            latitude,
            longitude,
            color,
            address,
            title,
            description,
            date,
            score,
            imageUris
        } = createPostDto

        const post = this.postRepository.create({
            latitude,
            longitude,
            color,
            address,
            title,
            description,
            date,
            score,
        })

        try {
            await this.postRepository.save(post);
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('장소를 추가하는 과정 에러가 발생했습니다.')
        }
        
        return post;
    }
}
