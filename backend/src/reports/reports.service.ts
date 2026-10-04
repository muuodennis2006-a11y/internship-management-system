import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { ReviewReportDto } from './dto/review-report.dto';
@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(studentUserId: string, dto: CreateReportDto) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        userId: studentUserId,
      },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }
    const placement = await this.prisma.placement.findUnique({
      where: {
        id: dto.placementId,
      },
    });
    if (!placement) {
      throw new NotFoundException('Placement not found');
    }
    if (placement.studentId !== student.id) {
      throw new ForbiddenException(
        'You can only submit reports for your own placement',
      );
    }
    if (placement.status === 'CANCELLED') {
      throw new BadRequestException(
        'Reports cannot be submitted for a cancelled placement',
      );
    }
    const weekStart = new Date(dto.weekStart);
    const weekEnd = new Date(dto.weekEnd);
    if (weekEnd < weekStart) {
      throw new BadRequestException(
        'Week end must be after week start',
      );
    }
    if (weekStart < placement.startDate || weekEnd > placement.endDate) {
      throw new BadRequestException(
        'Report week must fall within the placement period',
      );
    }
    const existing = await this.prisma.weeklyReport.findUnique({
      where: {
        studentId_weekNumber: {
          studentId: student.id,
          weekNumber: dto.weekNumber,
        },
      },
    });
    if (existing) {
      throw new BadRequestException(
        `Week ${dto.weekNumber} report has already been submitted`,
      );
    }
    return this.prisma.weeklyReport.create({
      data: {
        studentId: student.id,
        placementId: placement.id,
        weekNumber: dto.weekNumber,
        weekStart,
        weekEnd,
        activities: dto.activities,
        skillsLearned: dto.skillsLearned,
        challenges: dto.challenges,
      },
      include: {
        placement: {
          include: {
            supervisor: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            track: true,
          },
        },
      },
    });
  }
  async findStudentReports(studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        userId: studentUserId,
      },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }
    return this.prisma.weeklyReport.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        weekNumber: 'asc',
      },
      include: {
        placement: {
          include: {
            track: true,
            supervisor: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  async findSupervisorReports(supervisorUserId: string) {
    const supervisor = await this.prisma.supervisorProfile.findUnique({
      where: {
        userId: supervisorUserId,
      },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor profile not found');
    }
    return this.prisma.weeklyReport.findMany({
      where: {
        placement: {
          supervisorId: supervisor.id,
        },
      },
      orderBy: [
        {
          status: 'asc',
        },
        {
          weekNumber: 'asc',
        },
      ],
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        placement: {
          include: {
            track: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
  async findOneForSupervisor(
    supervisorUserId: string,
    reportId: string,
  ) {
    const supervisor = await this.prisma.supervisorProfile.findUnique({
      where: {
        userId: supervisorUserId,
      },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor profile not found');
    }
    const report = await this.prisma.weeklyReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        placement: {
          include: {
            track: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    if (report.placement.supervisorId !== supervisor.id) {
      throw new ForbiddenException(
        'You can only access reports from your assigned interns',
      );
    }
    return report;
  }
  async review(
    supervisorUserId: string,
    reportId: string,
    dto: ReviewReportDto,
  ) {
    const supervisor = await this.prisma.supervisorProfile.findUnique({
      where: {
        userId: supervisorUserId,
      },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor profile not found');
    }
    const report = await this.prisma.weeklyReport.findUnique({
      where: {
        id: reportId,
      },
      include: {
        placement: true,
      },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }
    if (report.placement.supervisorId !== supervisor.id) {
      throw new ForbiddenException(
        'You can only review reports from your assigned interns',
      );
    }
    if (report.status === 'REVIEWED') {
      throw new BadRequestException(
        'This report has already been reviewed',
      );
    }
    return this.prisma.weeklyReport.update({
      where: {
        id: reportId,
      },
      data: {
        status: 'REVIEWED',
        feedback: dto.feedback,
        reviewedAt: new Date(),
        reviewedById: supervisor.userId,
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        placement: {
          include: {
            track: true,
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
