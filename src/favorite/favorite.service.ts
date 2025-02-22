import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/user.entity';
import { Favorite } from './favorite.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoriteService {
    constructor(@InjectRepository(Favorite)private favoriteRepository: Repository<Favorite>) {}

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
