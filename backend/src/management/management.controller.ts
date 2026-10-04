import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ManagementService } from './management.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CreateTrackDto } from './dto/create-track.dto';
import { UpdateTrackDto } from './dto/update-track.dto';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as bcrypt from 'bcrypt';
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class ManagementController {
  constructor(
    private readonly managementService: ManagementService,
  ) {}
  @Get('dashboard')
  getDashboard(@Query() query: DashboardQueryDto) {
    return this.managementService.getDashboard(query);
  }
  @Get('students')
  getStudents() {
    return this.managementService.getStudents();
  }
  @Post('supervisors')
  async createSupervisor(@Body() dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    return this.managementService.createSupervisor(
      dto.name,
      dto.email,
      passwordHash,
      dto.department,
      dto.organization,
      dto.phone,
    );
  }
  @Get('supervisors')
  getSupervisors() {
    return this.managementService.getSupervisors();
  }
  @Post('tracks')
  createTrack(@Body() dto: CreateTrackDto) {
    return this.managementService.createTrack(
      dto.name,
      dto.description,
      dto.active,
    );
  }
  @Get('tracks')
  getTracks() {
    return this.managementService.getTracks();
  }
  @Patch('tracks/:id')
  updateTrack(
    @Param('id') id: string,
    @Body() dto: UpdateTrackDto,
  ) {
    return this.managementService.updateTrack(id, dto);
  }
}
