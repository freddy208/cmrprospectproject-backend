/* eslint-disable no-unused-vars */
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractToken(request);
    if (!token) return false;

    try {
      const decoded = this.jwtService.verify(token);
      (request as any).user = decoded; // typage explicite pour éviter TS erreurs
      return true;
    } catch (err) {
      return false;
    }
  }

  private extractToken(request: Request): string | null {
    const cookieToken = (request as any).cookies?.token;
    const headerToken = request.headers['authorization']?.split(' ')[1];
    return cookieToken || headerToken || null;
  }
}
