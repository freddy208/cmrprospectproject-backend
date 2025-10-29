import { Module } from '@nestjs/common';
import { SimulateurController } from './simulateur.controller';
import { SimulateurService } from './simulateur.service';
import { AuthModule } from '../auth/auth.module';
import { AuthorizationModule } from '../common/authorization/authorization.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuthModule, AuthorizationModule],
  controllers: [SimulateurController],
  providers: [SimulateurService, PrismaService],
})
export class SimulateurModule {}
