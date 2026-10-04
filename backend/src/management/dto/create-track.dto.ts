import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
export class CreateTrackDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsOptional()
  @IsString()
  description?: string;
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
