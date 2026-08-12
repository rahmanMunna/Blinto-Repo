import {
    Body,
    Controller,
    Get,
    Post,
    Req,
    Res,
    UnauthorizedException,
    UseGuards,
} from '@nestjs/common';
import type { Response } from "express";

import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { RegisterGuestDto } from './dto/register-guest.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { GoogleAuthGuard } from './gaurds/google-auth.guard';

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
    async login(@Body() user: LoginDto, @Res({ passthrough: true }) res: Response) {
        const { access_token, refresh_token } = await this.authService.signIn(user.username, user.password);

        res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return { access_token, refresh_token }
    }

    // @Post('refresh')

    // async refreshAccessToken(@Body() refreshTokenDto: RefreshTokenDto) {
    //     return this.authService.refreshAccessToken(
    //         refreshTokenDto.refreshToken,
    //     );
    // }

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
    @Post("refresh")
    async refresh(
        @Body() refreshTokenDto: RefreshTokenDto,
        // @Req() req: Request,
        @Res({ passthrough: true }) res: Response,
    ) {
        // const refreshToken = req.cookies.refresh_token;

        if (!refreshTokenDto.refreshToken) {
            throw new UnauthorizedException("Refresh token missing");
        }

        const { access_token, refresh_token } = await this.authService.refreshAccessToken(refreshTokenDto.refreshToken);

        res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        return { access_token, refresh_token }
    }



    // OAUTH

    @Get('google')
    @UseGuards(GoogleAuthGuard)
    async googleLogin() {
        // Passport redirects the user to Google
    }

    @Get('google/callback')
    @UseGuards(GoogleAuthGuard)
    async googleCallback(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const { access_token, refresh_token } = await this.authService.googleLogin(req.user);
        // Store cookies
        res.cookie("access_token", access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 15 * 60 * 1000,
            path: "/",
        });

        res.cookie("refresh_token", refresh_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/",
        });

        return { access_token, refresh_token };
    }


}