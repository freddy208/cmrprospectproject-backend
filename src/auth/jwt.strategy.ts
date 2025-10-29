/* eslint-disable prettier/prettier */
// src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { prisma } from '../config/database.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          console.log('🔑 ==================== JWT EXTRACTION ====================');
          console.log('🔑 Request cookies:', req?.cookies);
          console.log('🔑 accessToken dans cookies:', req?.cookies?.accessToken ? 'OUI' : 'NON');
          
          const token = req?.cookies?.accessToken;
          
          if (token) {
            console.log('✅ Token extrait:', token.substring(0, 20) + '...');
          } else {
            console.log('❌ Aucun token trouvé dans les cookies');
          }
          
          return token;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET || 'super-secret-key',
    });
    
    console.log('🔑 JwtStrategy initialisé avec secret:', process.env.JWT_SECRET ? 'CONFIGURÉ' : 'DÉFAUT');
  }

  async validate(payload: any) {
    console.log('🔑 ==================== JWT VALIDATION ====================');
    console.log('🔑 Payload reçu:', payload);
    console.log('🔑 User ID (sub):', payload.sub);
    console.log('🔑 Email:', payload.email);

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    
    console.log('🔑 User trouvé en DB:', user ? 'OUI' : 'NON');
    
    if (!user) {
      console.log('❌ User non trouvé en DB');
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    
    if (!user.isActive) {
      console.log('❌ User inactif');
      throw new UnauthorizedException('Utilisateur inactif');
    }
    
    console.log('✅ User validé:', user.email);
    console.log('🔑 ==================== FIN VALIDATION ====================');
    
    return user;
  }
}