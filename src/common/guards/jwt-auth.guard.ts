/* eslint-disable prettier/prettier */
// src/common/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('🔐 ==================== JWT AUTH GUARD ====================');
    console.log('🔐 URL:', request.url);
    console.log('🔐 Method:', request.method);
    console.log('🔐 Cookies reçus:', request.cookies);
    console.log(
      '🔐 accessToken présent:',
      request.cookies?.accessToken ? 'OUI' : 'NON',
    );
    console.log('🔐 Authorization header:', request.headers.authorization);
    
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    console.log('🔐 ==================== HANDLE REQUEST ====================');
    console.log('🔐 Erreur:', err);
    console.log('🔐 User trouvé:', user ? 'OUI' : 'NON');
    console.log('🔐 Info:', info);
    
    if (err || !user) {
      console.log('❌ Authentification échouée');
      throw err || new UnauthorizedException('Non autorisé');
    }
    
    console.log('✅ Authentification réussie, user:', user.email);
    return user;
  }
}