import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { RegisterGuestDto } from './dto/register-guest.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
// import {configService} from '@nestjs/config' 

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async isUsernameExist(username: string): Promise<boolean> {
        return await this.userService.isUsernameExist(username);
    }

    async isEmailExist(email: string): Promise<boolean> {
        return await this.userService.isEmailExist(email);
    }



    async signIn(
        username: string,
        pass: string,
    ): Promise<{ access_token: string, refresh_token: string }> {

        const user = await this.userService.findByUsername(username);

        if (!user) {
            throw new NotFoundException('user not found with this user name')
        }

        const isPassValid = await this.userService.IsValidatePassword(pass, user?.password);

        if (!isPassValid) {
            throw new UnauthorizedException('Invalid password')
        }


        const payload = { sub: user.id, username: user.username, role: user.role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: '5m',
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '10m',
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
        };
    }

    async registerGuest(
        registerGuestDto: RegisterGuestDto,
    ) {

        if (registerGuestDto.password !== registerGuestDto.confirmPassword) {
            throw new NotFoundException("Password and confirm password not match");
        }

        const usernameExists = await this.isUsernameExist(registerGuestDto.username);

        if (usernameExists) {
            throw new ConflictException('Username already exists');
        }

        const emailExists =
            await this.isEmailExist(registerGuestDto.email);

        if (emailExists) {
            throw new ConflictException('Email already exists');
        }

        const hashedPassword = await bcrypt.hash(registerGuestDto.password, 10);

        const user = await this.userService.createUser(
            {
                username: registerGuestDto.username,
                email: registerGuestDto.email,
                password: hashedPassword,
            },
            'guest',
        );

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
        };
    }

    async refreshAccessToken(
        refreshToken: string,
    ): Promise<{
        access_token: string;
        refresh_token: string;
    }> {
        try {
            const payload =
                await this.jwtService.verifyAsync(refreshToken, {
                    secret: this.configService.getOrThrow<string>(
                        'JWT_REFRESH_SECRET',
                    ),
                });

            const newPayload = {
                sub: payload.sub,
                username: payload.username,
                role: payload.role,
            };

            const accessToken =
                await this.jwtService.signAsync(newPayload, {
                    secret: this.configService.getOrThrow<string>(
                        'JWT_ACCESS_SECRET',
                    ),
                    expiresIn: '2m',
                });

            const newRefreshToken =
                await this.jwtService.signAsync(newPayload, {
                    secret: this.configService.getOrThrow<string>(
                        'JWT_REFRESH_SECRET',
                    ),
                    expiresIn: '10m',
                });

            return {
                access_token: accessToken,
                refresh_token: newRefreshToken,
            };
        } catch {
            throw new UnauthorizedException(
                'Invalid or expired refresh token',
            );
        }
    }

}