import { Module } from '@nestjs/common';
import { FormationService } from './formation.service';
import { FormationController } from './formation.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
// On n'importe plus AuthorizationModule !

@Module({
  imports: [AuthModule], // <--- Seul AuthModule est nécessaire
  controllers: [FormationController],
  providers: [FormationService, PrismaService],
})
export class FormationModule {}
