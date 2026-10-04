import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ManagementModule } from './management/management.module';
import { PlacementsModule } from './placements/placements.module';
import { ReportsModule } from './reports/reports.module';
@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ManagementModule,
    PlacementsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
