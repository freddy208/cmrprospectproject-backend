import { Module } from '@nestjs/common';
import { ProspectController } from './prospect.controller';
import { ProspectService } from './prospect.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ProspectController],
  providers: [ProspectService, PrismaService],
})
export class ProspectModule {}
