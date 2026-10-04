import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  async registerStudent(dto: RegisterDto) {
    const existingEmail = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });
    if (existingEmail) {
      throw new ConflictException(
        'An account with this email already exists',
      );
    }
    const existingStudentNumber =
      await this.prisma.studentProfile.findUnique({
        where: {
          studentNumber: dto.studentNumber,
        },
      });
    if (existingStudentNumber) {
      throw new ConflictException(
        'A student with this student number already exists',
      );
    }
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name.trim(),
        email: dto.email.toLowerCase().trim(),
        passwordHash,
        role: 'STUDENT',
        studentProfile: {
          create: {
            studentNumber: dto.studentNumber.trim(),
            programme: dto.programme.trim(),
            department: dto.department.trim(),
            phone: dto.phone?.trim(),
          },
        },
      },
      include: {
        studentProfile: true,
      },
    });
    return this.createAuthResponse(user);
  }
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase().trim(),
      },
      include: {
        studentProfile: true,
        supervisorProfile: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createAuthResponse(user);
  }
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        studentProfile: true,
        supervisorProfile: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User account no longer exists');
    }
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
  private async createAuthResponse(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);
    const { passwordHash, ...safeUser } = user;
    return {
      accessToken,
      user: safeUser,
    };
  }
}
