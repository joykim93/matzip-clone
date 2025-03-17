import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Favorite } from './favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
    constructor(@InjectRepository(Favorite)private favoriteRepository: Repository<Favorite>) {}

    async getFavorites(page: number, user: User) {
        const perPage = 10;
        const offset = (page - 1) * 10;
        const favorites = await this.favoriteRepository
            .createQueryBuilder('favorite')
            .innerJoinAndSelect('favorite.post', 'post')
            .leftJoinAndSelect('post.images', 'image')
            .where('favorite.userId = :userId', { userId: user.id })
            .orderBy('post.date', 'DESC')
            .skip(offset)
            .take(perPage)
            .getMany();

            const newPosts = favorites.map((favorite) => {
                const post = favorite.post;
                const images = [...post.images].sort((a, b) => (a.id = b.id));
                return { ...post, images };
            })

            return newPosts;
    }

    async toggleFavorite(postId: number, user: User) {
        const existingFavorite = await this.favoriteRepository.findOne({
            where: {
                post: { id: postId },
                user: { id: user.id },
            },
            relations: ['post', 'user']
        });

        if (existingFavorite) {
            await this.favoriteRepository.delete({
                id: existingFavorite.id
            });
        } else {
            const newFavorite = this.favoriteRepository.create({
                post: { id: postId },
                user: { id: user.id },
            })
            await this.favoriteRepository.save(newFavorite)
        }
        return postId;
    }
}
