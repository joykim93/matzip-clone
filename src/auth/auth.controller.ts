import { Body, Controller, Delete, Get, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorators';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { EditProfileDto } from './dto/edit-profile.dto';
import { MarkerColor } from 'src/post/marker-color.enum';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService){}

    @Post('/signup')
    signup(@Body(ValidationPipe) authDto: AuthDto) {
        return this.authService.signup(authDto);
    }

    @Post('/signin')
    signin(@Body(ValidationPipe) authDto: AuthDto) {
        return this.authService.signin(authDto);
    }

    @Get('/refresh')
    @UseGuards(AuthGuard())
    refresh(@GetUser() user: User) {
        return this.authService.refreshToken(user);
    }

    @Get('/me')
    @UseGuards(AuthGuard())
    getProfile(@GetUser() user: User) {
        return this.authService.getProfile(user);
    }

    @Patch('/me')
    @UseGuards(AuthGuard())
    editProfile(
        @GetUser() user: User,
        @Body() editProfileDto: EditProfileDto
    ) {
        return this.authService.editProfile(user, editProfileDto);
    }

    // to do. 로그아웃 정확히 구현이 필요함
    @Post('/logout')
    @UseGuards(AuthGuard())
    logout(@GetUser() user: User) {
        return this.authService.deleteRefreshToken(user);
    }

    @Delete('/me')
    @UseGuards(AuthGuard())
    deleteAccount(@GetUser() user: User) {
        return this.authService.deleteAccount(user);
    }

    @Patch('/category')
    @UseGuards(AuthGuard())
    updateCategory(
        @Body() categories: Record<keyof MarkerColor, string>,
        @GetUser() user: User,
    ) {
        return this.authService.updateCategory(user, categories);
    }
}
