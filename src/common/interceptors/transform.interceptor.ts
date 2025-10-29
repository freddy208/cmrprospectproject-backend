/* eslint-disable prettier/prettier */
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // ✅ Ne pas transformer les réponses des routes d'auth
    const skipTransformRoutes = [
      '/api/v1/auth/login',
      '/api/v1/auth/refresh',
      '/api/v1/auth/me',
      '/api/v1/auth/logout',
    ];
    
    if (skipTransformRoutes.some(route => request.url.includes(route))) {
      return next.handle();
    }
    
    return next.handle().pipe(
      map(data => ({
        status: 'success',
        data,
      })),
    );
  }
}