import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './post.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/user.entity';
import { Image } from 'src/image/image.entity';

@Injectable()
export class PostService {

    constructor(
        @InjectRepository(Post)
        private postRepository: Repository<Post>,
        @InjectRepository(Image)
        private imageRepository: Repository<Image>,
    ){}

    async getAllMarkers(user: User) {
        try {
            const markers = await this.postRepository.createQueryBuilder('post')
            .where('post.userId = :userId', { userId: user.id })
            .select([
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

    async getPosts(page: number, user: User): Promise<Post[]> {
        const perPage = 10;
        const offset = (page - 1) * perPage;
        return this.postRepository
            .createQueryBuilder('post')
            .leftJoinAndSelect('post.images', 'image')
            .where('post.userId = :userId', { userId: user.id })
            .orderBy('post.date', 'DESC')
            .take(perPage)
            .skip(offset)
            .getMany()
    }

    async getPostById(id: number, user: User): Promise<Post | null> {
        try {
            const foundPost = await this.postRepository
                .createQueryBuilder('post')
                .leftJoinAndSelect('post.images', 'image')
                .where('post.id = :id', { id })
                .andWhere('post.userId = :userId', { userId: user.id })
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

    async createPost(createPostDto: CreatePostDto, user: User) {
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
            user,
        })

        const images = imageUris.map((uri) => this.imageRepository.create(uri));
        post.images = images;

        try {
            await this.imageRepository.save(images);
            await this.postRepository.save(post);
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('장소를 추가하는 과정 에러가 발생했습니다.')
        }

        const { user: _, ...postWithoutUser } = post;

        return postWithoutUser;
    }

    async updatePost(id: number, updatePost: Omit<CreatePostDto, 'latitude' | 'longitude' | 'address'>, user: User): Promise<Post> {
        const post = await this.getPostById(id, user);
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

        const images = imageUris.map((uri) => this.imageRepository.create(uri));
        post.images = images;

        try {
            await this.imageRepository.save(images);
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

    async deletePost(id: number, user: User) {
        const result = await this.postRepository
                .createQueryBuilder('post')
                .delete()
                .from(Post)
                .where('id = :id', { id })
                .andWhere('userId = :userId', { userId: user.id })
                .execute();
            
        if (result.affected === 0) {
            throw new NotFoundException('존재하지 않은 피드입니다.')
        }
        return id
    }
}
