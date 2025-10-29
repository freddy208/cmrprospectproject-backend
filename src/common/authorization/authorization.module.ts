import { Module } from '@nestjs/common';
import { AuthorizationService } from './authorization.service';

@Module({
  providers: [AuthorizationService],
  exports: [AuthorizationService], // <-- très important !
})
export class AuthorizationModule {}
