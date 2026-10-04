import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}
  @Post('students/me/reports')
  @Roles('STUDENT')
  create(
    @CurrentUser() user: any,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(user.id, dto);
  }
  @Get('students/me/reports')
  @Roles('STUDENT')
  getStudentReports(@CurrentUser() user: any) {
    return this.reportsService.findStudentReports(user.id);
  }
  @Get('supervisors/me/reports')
  @Roles('SUPERVISOR')
  getSupervisorReports(@CurrentUser() user: any) {
    return this.reportsService.findSupervisorReports(user.id);
  }
  @Get('supervisors/me/reports/:id')
  @Roles('SUPERVISOR')
  getSupervisorReport(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.reportsService.findOneForSupervisor(user.id, id);
  }
  @Patch('supervisors/me/reports/:id/review')
  @Roles('SUPERVISOR')
  review(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ReviewReportDto,
  ) {
    return this.reportsService.review(user.id, id, dto);
  }
}
