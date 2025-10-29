import { Module } from '@nestjs/common';
import { FormationService } from './formation.service';
import { FormationController } from './formation.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [FormationController],
  providers: [FormationService, PrismaService],
})
export class FormationModule {}
