import { Module } from '@nestjs/common';
import { UsersService } from './user.service';
import { UsersController } from './user.controller';
import { AuthModule } from '../auth/auth.module'; // <-- importer ici
import { PrismaService } from '../prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UserModule {}
