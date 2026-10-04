import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
} from 'class-validator';
export class CreateReportDto {
  @IsString()
  @IsNotEmpty()
  placementId: string;
  @IsInt()
  @Min(1)
  weekNumber: number;
  @IsDateString()
  weekStart: string;
  @IsDateString()
  weekEnd: string;
  @IsString()
  @IsNotEmpty()
  activities: string;
  @IsString()
  @IsNotEmpty()
  skillsLearned: string;
  @IsString()
  @IsNotEmpty()
  challenges: string;
}
