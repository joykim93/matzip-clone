import { Body, Controller, Get, Patch, Post, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { GetUser } from 'src/@common/decorators/get-user.decorators';
import { User } from './user.entity';
import { AuthGuard } from '@nestjs/passport';
import { EditProfileDto } from './dto/edit-profile.dto';

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
}
