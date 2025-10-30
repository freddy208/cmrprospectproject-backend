import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { CommentsModule } from './comments/comments.module';
import { InteractionModule } from './interaction/interaction.module';
import { FormationModule } from './formation/formation.module';
import { SimulateurModule } from './simulateur/simulateur.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardModule } from './dashboard/dashboard.module';
import { AdministrationModule } from './administration/administration.module';
import { ProspectModule } from './prospect/prospect.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 👈 pour que ConfigService soit disponible partout
      envFilePath: '.env', // facultatif
    }),
    AuthModule,
    UserModule,
    CommentsModule,
    InteractionModule,
    FormationModule,
    SimulateurModule,
    DashboardModule,
    AdministrationModule,
    ProspectModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
