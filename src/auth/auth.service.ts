import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { AuthDto } from './dto/duth.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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
}
