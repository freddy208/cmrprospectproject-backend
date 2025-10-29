import { Module } from '@nestjs/common';
import { InteractionsService } from './interaction.service';
import { InteractionsController } from './interaction.controller';
import { PrismaService } from '../prisma.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [InteractionsController],
  providers: [InteractionsService, PrismaService],
})
export class InteractionModule {}
