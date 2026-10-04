import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
export class RegisterDto {
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
  studentNumber: string;
  @IsString()
  @IsNotEmpty()
  programme: string;
  @IsString()
  @IsNotEmpty()
  department: string;
  @IsOptional()
  @IsString()
  @Matches(/^[0-9+\-\s()]{7,20}$/, {
    message: 'Please provide a valid phone number',
  })
  phone?: string;
}
