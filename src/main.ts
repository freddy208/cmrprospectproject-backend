import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // ✅ Parser les cookies pour gérer JWT via cookies httpOnly
  app.use(cookieParser());

  // ✅ Servir des fichiers statiques (si export ou upload)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // ✅ Configuration CORS (indispensable pour cookies + frontend)
  app.enableCors({
    origin: [
      'http://localhost:5173', // ton frontend local (Vite/React)
      'https://cmrprospect.vercel.app', // ton futur domaine de prod
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
    credentials: true,
  });

  // ✅ Préfixe global versionné
  app.setGlobalPrefix('api/v1');

  // ✅ Pipes globaux pour validation DTO
  app.useGlobalPipes(new ValidationPipe());

  // ✅ Intercepteurs globaux (logs + transformation des réponses)
  app.useGlobalInterceptors(new TransformInterceptor());

  // ✅ Filtres globaux pour gestion des erreurs
  app.useGlobalFilters(new HttpExceptionFilter());

  // ✅ Optionnel : rediriger la racine vers un petit message
  const httpAdapter = app.getHttpAdapter();
  httpAdapter.get('/', (req: Request, res: Response) => {
    res.send('🚀 CMR Prospect API is running');
  });

  // ✅ Démarrage du serveur
  const port = configService.get('APP_PORT') ?? process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`🚀 CMR Prospect API running on http://localhost:${port}`);
}

bootstrap().catch((err: Error) => {
  console.error('❌ Error during bootstrap:', err);
  process.exit(1);
});
