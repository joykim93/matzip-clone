import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EditProfileDto } from './dto/edit-profile.dto';
import { MarkerColor } from 'src/post/marker-color.enum';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService
    ){}

    async signup(authDto: AuthDto) {
        const { email, password } = authDto;
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            loginType: 'email',
        });

        try {
            await this.userRepository.save(user);
        } catch (error) {
            console.log(error)
            if (error.code === '23505') {
                throw new ConflictException('이미 존재하는 이메일입니다.');
            }
            throw new InternalServerErrorException('회원가입 도중 에러가 발생했습니다.')
        }
    }

    async signin(authDto: AuthDto) {
        const { email, password } = authDto;
        const user = await this.userRepository.findOneBy({ email });
        if (!user) {
            throw new NotFoundException('존재하지 않는 이메일 입니다.');
        }
        if (!(await bcrypt.compare(password, user.password))) {
            throw new UnauthorizedException('비밀번호가 일치하지 않습니다.');
        }

        const { accessToken, refreshToken } = await this.getTokens({ email })
        await this.updateHashedRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken }
    }

    private async getTokens(payload: { email: string}) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_TOKEN_EXPIRATION')
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_TOKEN_EXPIRATION')
            })
        ])

        return { accessToken, refreshToken };
    }

    private async updateHashedRefreshToken(id: number, refreshToken: string) {
        const salt = await bcrypt.genSalt()
        const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

        try {
            await this.userRepository.update(id, { hashedRefreshToken })
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('refresh 토큰 업데이트 중 에러가 발생했습니다.')
        }
    }

    async refreshToken(user: User) {
        const { email } = user;
        const { accessToken, refreshToken } = await this.getTokens({ email });
        await this.updateHashedRefreshToken(user.id, refreshToken);
        return { accessToken, refreshToken }
    }
    
    async getProfile(user: User) {
        const { password, hashedRefreshToken, ...rest } = user

        return { ...rest };
    }

    async editProfile(user: User, editProfile: EditProfileDto) {
        const currentProfile = await this.userRepository
            .createQueryBuilder('user')
            .where('user.id = :userId', { userId: user.id })
            .getOne();

        if (!currentProfile) {
            throw new NotFoundException('존재하지 않은 유저 입니다.');
        }
        const { nickname, imageUri } = editProfile;
        currentProfile.nickname = nickname;
        currentProfile.imageUri = imageUri;
        try {
            await this.userRepository.save(currentProfile);
            return this.getProfile(currentProfile);
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('프로필을 수정 중 에러가 발생했습니다.')
        }
    }

    async deleteRefreshToken(user: User) {
        try {
            await this.userRepository.update(user.id, { hashedRefreshToken: null })
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException('로그아웃 중 에러가 발생했습니다.')
        }
    }

    async deleteAccount(user: User) {
        try {
            await this.userRepository.createQueryBuilder('user').delete().from(User).where('id = :id', { id: user.id })
        } catch (error) {
            console.log(error)
            throw new BadRequestException('탈퇴할 수 없습니다.')
        }
    }
    
    async updateCategory(
        user: User,
        categories: Record<keyof MarkerColor, string>,
    ) {
        const { RED, YELLOW, BLUE, GREEN, PURPLE } = MarkerColor;

        if (
            !Object.keys(categories).every((color: MarkerColor) =>
            [RED, YELLOW, BLUE, GREEN, PURPLE].includes(color))
        ) {
            throw new BadRequestException('유효하지 않은 카테고리입니다.');
        }

        user[RED] = categories[RED];
        user[YELLOW] = categories[YELLOW];
        user[BLUE] = categories[BLUE];
        user[GREEN] = categories[GREEN];
        user[PURPLE] = categories[PURPLE];

        try {
            await this.userRepository.save(user);
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('카테고리 수정 도중 에러가 발생했습니다.');
        }

        return this.getProfile(user);
    }
}
