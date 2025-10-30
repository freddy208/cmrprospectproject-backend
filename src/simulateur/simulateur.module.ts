import { Module } from '@nestjs/common';
import { SimulateurController } from './simulateur.controller';
import { SimulateurService } from './simulateur.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaService } from '../prisma.service';
// On n'importe plus AuthorizationModule !

@Module({
  imports: [AuthModule], // <--- Seul AuthModule est nécessaire
  controllers: [SimulateurController],
  providers: [SimulateurService, PrismaService],
})
export class SimulateurModule {}
