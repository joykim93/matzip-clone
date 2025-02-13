import { IsString, MaxLength, MinLength } from "class-validator";

export class AuthDto {
    @IsString()
    @MinLength(6)
    @MaxLength(50)
    // to do. 이메일 형식 정규표현식
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(20)
    // to do. 비밀번호 형식 정규표현식
    password: string;
}