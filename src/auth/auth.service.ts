/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { prisma } from '../config/database.config';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Login
  async login(dto: LoginDto) {
    // --- CORRECTION CRUCIALE ---
    // On doit charger la relation `role` pour y accéder plus tard
    const user = await prisma.user.findUnique({ 
      where: { email: dto.email },
      include: { role: true } // <--- AJOUT ESSENTIEL
    });
    
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Email ou mot de passe incorrect');

    if (!user.isActive || user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Compte inactif ou supprimé');
    }

    // --- CORRECTION CRUCIALE ---
    // Générer access & refresh token avec le NOM du rôle dans le payload
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role.name }, // <--- ON UTILISE user.role.name
      { expiresIn: '15m' }
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      { expiresIn: '7d' }
    );

    // Stocker le refresh token hashé dans la DB
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken, lastLogin: new Date() },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        // --- CORRECTION ---
        // On retourne le nom du rôle pour que le frontend puisse l'utiliser facilement
        role: user.role.name, 
      },
    };
  }

  // Refresh token
  async refreshTokens(userId: string, token: string) {
    // --- CORRECTION CRUCIALE ---
    // On charge aussi la relation `role` ici
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      include: { role: true } // <--- AJOUT ESSENTIEL
    });

    if (!user || !user.refreshToken)
      throw new UnauthorizedException('Utilisateur non autorisé');

    const isValid = await bcrypt.compare(token, user.refreshToken);
    if (!isValid) throw new UnauthorizedException('Refresh token invalide');

    // --- CORRECTION CRUCIALE ---
    // Générer de nouveaux tokens avec le nom du rôle
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role.name }, // <--- ON UTILISE user.role.name
      { expiresIn: '15m' }
    );
    const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return { accessToken, refreshToken };
  }

  // Logout
  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // Forgot password (aucun changement nécessaire)
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');

    const resetToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: expiresAt,
      },
    });

    return {
      message:
        'Un email a été envoyé avec les instructions pour réinitialiser le mot de passe',
    };
  }

  // Reset password (aucun changement nécessaire)
  async resetPassword(dto: ResetPasswordDto) {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: dto.token,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user) throw new BadRequestException('Token invalide ou expiré');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return { message: 'Mot de passe réinitialisé avec succès' };
  }

  // Cette méthode appelle `refreshTokens`, donc elle sera automatiquement corrigée
  async refreshTokensUsingRawToken(token: string) {
    const payload: any = this.jwtService.decode(token);
    if (!payload || !payload.sub) throw new UnauthorizedException('Token invalide');

    return this.refreshTokens(payload.sub, token);
  }
}