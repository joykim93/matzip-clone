import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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

    async getAllMarkers() {
        try {
            const markers = await this.postRepository.createQueryBuilder('post').select([
                'post.id',
                'post.latitude',
                'post.longitude',
                'post.color',
                'post.score',
            ])
            .getMany()

            return markers;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('마커를 가져오는 도중 에러가 발생했습니다.')
        }
    }

    async getPosts(page: number): Promise<Post[]> {
        const perPage = 10;
        const offset = (page - 1) * perPage;
        return this.postRepository
            .createQueryBuilder('post')
            .orderBy('post.date', 'DESC')
            .take(perPage)
            .skip(offset)
            .getMany()
    }

    async getPostById(id: number): Promise<Post | null> {
        try {
            const foundPost = await this.postRepository
                .createQueryBuilder('post')
                .where('post.id = :id', { id })
                .getOne()

            if (!foundPost) {
                throw new NotFoundException('존재하지 않은 피드입니다.');
            }
            return foundPost;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('장소를 가져오는 도중 에러가 발생했습니다.')
        }
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

    async updatePost(id: number, updatePost: Omit<CreatePostDto, 'latitude' | 'longitude' | 'address'>): Promise<Post> {
        const post = await this.getPostById(id);
        if (!post) {
            throw new NotFoundException('존재하지 않은 피드입니다.');
        }

        const {
            color,
            title,
            description,
            date,
            score,
            imageUris
        } = updatePost

        try {
            const updatePost = await this.postRepository.save({
                ...post,
                color,
                title,
                description,
                date,
                score,
            });
            return updatePost;
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('장소를 추가하는 과정 에러가 발생했습니다.')
        }        
    }

    async deletePost(id: number) {
        const result = await this.postRepository
                .createQueryBuilder('post')
                .delete()
                .from(Post)
                .where('id = :id', { id })
                .execute();
            
        if (result.affected === 0) {
            throw new NotFoundException('존재하지 않은 피드입니다.')
        }
        return id
    }
}
