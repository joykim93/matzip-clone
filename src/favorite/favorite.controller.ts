import { Controller, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FavoriteService } from './favorite.service';
import { GetUser } from 'src/@common/decorators/get-user.decorators';
import { User } from 'src/auth/user.entity';

@Controller('favorites')
@UseGuards(AuthGuard())
export class FavoriteController {
    constructor(private favoriteService: FavoriteService) {}

    @Post('/:id')
    toggleFavorite(
        @Param('id', ParseIntPipe) id : number,
        @GetUser() user: User
    ) {
        return this.favoriteService.toggleFavorite(id, user);
    }
}
