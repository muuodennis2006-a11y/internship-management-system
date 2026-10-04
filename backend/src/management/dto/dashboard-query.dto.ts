import { IsOptional, IsString } from 'class-validator';
export class DashboardQueryDto {
  @IsOptional()
  @IsString()
  department?: string;
  @IsOptional()
  @IsString()
  trackId?: string;
}
