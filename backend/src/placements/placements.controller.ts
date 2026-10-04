import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlacementsController {
  constructor(private readonly placementsService: PlacementsService) {}
  @Post('admin/placements')
  @Roles('ADMIN')
  create(@Body() dto: CreatePlacementDto) {
    return this.placementsService.create(dto);
  }
  @Get('admin/placements')
  @Roles('ADMIN')
  findAll() {
    return this.placementsService.findAll();
  }
  @Get('admin/placements/:id')
  @Roles('ADMIN')
  findOne(@Param('id') id: string) {
    return this.placementsService.findOne(id);
  }
  @Patch('admin/placements/:id')
  @Roles('ADMIN')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePlacementDto,
  ) {
    return this.placementsService.update(id, dto);
  }
  @Delete('admin/placements/:id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.placementsService.remove(id);
  }
  @Get('students/me/placement')
  @Roles('STUDENT')
  getStudentPlacement(@CurrentUser() user: any) {
    return this.placementsService.getStudentPlacement(user.id);
  }
  @Get('supervisors/me/interns')
  @Roles('SUPERVISOR')
  getSupervisorInterns(@CurrentUser() user: any) {
    return this.placementsService.getSupervisorInterns(user.id);
  }
}
