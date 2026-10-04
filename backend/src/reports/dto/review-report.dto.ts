import { IsNotEmpty, IsString } from 'class-validator';
export class ReviewReportDto {
  @IsString()
  @IsNotEmpty()
  feedback: string;
}
