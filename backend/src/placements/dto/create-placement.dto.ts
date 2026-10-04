import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export enum PlacementStatusDto {
  PLANNED = 'PLANNED',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}
export class CreatePlacementDto {
  @IsString()
  @IsNotEmpty()
  studentId: string;
  @IsString()
  @IsNotEmpty()
  supervisorId: string;
  @IsString()
  @IsNotEmpty()
  trackId: string;
  @IsDateString()
  startDate: string;
  @IsDateString()
  endDate: string;
  @IsOptional()
  @IsEnum(PlacementStatusDto)
  status?: PlacementStatusDto;
}
