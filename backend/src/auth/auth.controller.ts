import {
    Body,
    Controller,
    Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterGuestDto } from './dto/register-guest.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({
        summary: 'Register a guest user',
    })
    @ApiResponse({
        status: 201,
        description: 'Guest user successfully registered',
    })
    @ApiResponse({
        status: 409,
        description: 'Username or email already exists',
    })
    async registerGuest(@Body() registerGuestDto: RegisterGuestDto) {
        return await this.authService.registerGuest(
            registerGuestDto,
        );
    }

    // login
    @Post('login')
    async login(@Body() user: LoginDto) {
        // return user
        return await this.authService.signIn(user.username, user.password);
    }

    @Post('refresh')
    @ApiOperation({
        summary: 'Refresh access token',
        description:
            'Generates a new access token using a valid refresh token.',
    })
    @ApiResponse({
        status: 200,
        description: 'Access token refreshed successfully.',
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token.',
    })
    async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshAccessToken(
            refreshTokenDto.refreshToken,
        );
    }
}