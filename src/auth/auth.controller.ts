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
  async login(
    @Body() dto: LoginDto,
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response
  ) {
    console.log('🔵 ==================== DEBUT LOGIN ====================');
    console.log('🔵 Origin:', req.headers.origin);
    console.log('🔵 Referer:', req.headers.referer);
    console.log('🔵 User-Agent:', req.headers['user-agent']);
    console.log('🔵 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔵 Email:', dto.email);

    const { accessToken, refreshToken, user } = await this.authService.login(dto);

    console.log('🔵 User récupéré:', user ? `${user.firstName} ` : 'AUCUN');
    console.log('🔵 AccessToken généré:', accessToken ? 'OUI' : 'NON');
    console.log('🔵 RefreshToken généré:', refreshToken ? 'OUI' : 'NON');

    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      partitioned: true,
    };

    console.log('🍪 Options des cookies:', JSON.stringify(cookieOptions, null, 2));

    // Cookies sécurisés
    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 min
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
    });

    console.log('✅ Cookies définis dans la réponse');
    console.log('🔵 Response headers Set-Cookie:', res.getHeader('Set-Cookie'));
    console.log('🔵 ==================== FIN LOGIN ====================');

    return { user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response
  ) {
    console.log('🟡 ==================== DEBUT REFRESH ====================');
    console.log('🟡 Cookies reçus:', req.cookies);
    console.log('🟡 refreshToken présent:', req.cookies['refreshToken'] ? 'OUI' : 'NON');

    const token = req.cookies['refreshToken'];
    if (!token) {
      console.log('❌ Refresh token manquant');
      throw new UnauthorizedException('Refresh token manquant');
    }

    // Appel à AuthService pour gérer le refresh
    const tokens = await this.authService.refreshTokensUsingRawToken(token);

    console.log('🟡 Nouveaux tokens générés');

    const isProduction = process.env.NODE_ENV === 'production';
    
    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      path: '/',
      partitioned: true,
    };

    // Mettre à jour les cookies
    res.cookie('accessToken', tokens.accessToken, {
      ...cookieOptions,
      maxAge: 3600000,
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    console.log('✅ Cookies refresh définis');
    console.log('🟡 ==================== FIN REFRESH ====================');

    return { message: 'Tokens renouvelés' };
  }

  @Post('logout')
  async logout(
    @Req() req: express.Request,
    @Res({ passthrough: true }) res: express.Response
  ) {
    console.log('🔴 ==================== DEBUT LOGOUT ====================');
    console.log('🔴 Cookies reçus:', req.cookies);

    const token = req.cookies['refreshToken'];
    if (!token) {
      console.log('❌ Refresh token manquant pour logout');
      throw new UnauthorizedException('Refresh token manquant');
    }

    const payload: any = await this.authService.refreshTokensUsingRawToken(token);
    await this.authService.logout(payload.sub);

    res.clearCookie('accessToken', {
      path: '/',
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      partitioned: true,
    });

    res.clearCookie('refreshToken', {
      path: '/',
      sameSite: 'none',
      secure: process.env.NODE_ENV === 'production',
      partitioned: true,
    });

    console.log('✅ Cookies effacés');
    console.log('🔴 ==================== FIN LOGOUT ====================');

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
  async getProfile(
    @CurrentUser() user: any,
    @Req() req: express.Request
  ) {
    console.log('🟢 ==================== DEBUT /auth/me ====================');
    console.log('🟢 Cookies reçus:', req.cookies);
    console.log('🟢 accessToken présent:', req.cookies?.accessToken ? 'OUI' : 'NON');
    console.log('🟢 User après guard:', user ? `${user.firstName} ${user.lastName}` : 'AUCUN');
    console.log('🟢 ==================== FIN /auth/me ====================');

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