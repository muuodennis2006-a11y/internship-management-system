import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsString()
  @IsNotEmpty()
  department: string;
  @IsOptional()
  @IsString()
  organization?: string;
  @IsOptional()
  @IsString()
  phone?: string;
}
