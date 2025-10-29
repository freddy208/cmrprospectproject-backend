import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConfig().secret,
      signOptions: { expiresIn: jwtConfig().expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [JwtModule, AuthService], // <-- Très important !
})
export class AuthModule {}
