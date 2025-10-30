/* eslint-disable prettier/prettier */
// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from '../config/database.config'; // Assurez-vous que ce chemin est correct

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          // ... votre logique d'extraction reste la même
          const token = req?.cookies?.accessToken;
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
  }

  async validate(payload: any) {
    // --- CORRECTION CRUCIALE ---
    // On charge l'utilisateur AVEC sa relation `role`
    const user = await prisma.user.findUnique({ 
      where: { id: payload.sub },
      include: { role: true } // <--- CECI EST L'AJOUT ESSENTIEL
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Utilisateur non trouvé ou inactif');
    }
    
    // L'objet `user` retourné contiendra maintenant :
    // { id, email, ..., roleId: '...', role: { id, name, description } }
    return user;
  }
}