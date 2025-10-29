/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
import { Controller, Post, Body, Res, HttpCode, Req, UnauthorizedException, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import express from 'express';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: express.Response) {
    const { accessToken, refreshToken, user } = await this.authService.login(dto);

    // Cookies sécurisés
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 15 * 60 * 1000, // 15 min
    });
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response
  ) {
    const token = req.cookies['refreshToken'];
    if (!token) throw new UnauthorizedException('Refresh token manquant');

    // Appel à AuthService pour gérer le refresh
    const tokens = await this.authService.refreshTokensUsingRawToken(token);

    // Mettre à jour les cookies
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000,
      sameSite: 'none',
      path: '/',
      partitioned: true,
    });
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'none',
      path: '/',
      partitioned: true,
    });

    return { message: 'Tokens renouvelés' };
  }


  @Post('logout')
  async logout(@Req() req: express.Request, @Res({ passthrough: true }) res: express.Response) {
    const token = req.cookies['refreshToken'];
    if (!token) throw new UnauthorizedException('Refresh token manquant');

    const payload: any = this.authService.refreshTokensUsingRawToken(token);
    await this.authService.logout(payload.sub);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Déconnecté avec succès' };
  }
  
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      country: user.country,
    };
  }
}
