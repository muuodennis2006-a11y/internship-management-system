import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePlacementDto } from './dto/create-placement.dto';
import { UpdatePlacementDto } from './dto/update-placement.dto';
@Injectable()
export class PlacementsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(dto: CreatePlacementDto) {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid placement dates');
    }
    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be after the start date',
      );
    }
    const student = await this.prisma.studentProfile.findUnique({
      where: { id: dto.studentId },
      include: { user: true },
    });
    if (!student || student.user.role !== 'STUDENT') {
      throw new BadRequestException('Student profile not found');
    }
    const supervisor = await this.prisma.supervisorProfile.findUnique({
      where: { id: dto.supervisorId },
      include: { user: true },
    });
    if (!supervisor || supervisor.user.role !== 'SUPERVISOR') {
      throw new BadRequestException('Supervisor profile not found');
    }
    const track = await this.prisma.track.findUnique({
      where: { id: dto.trackId },
    });
    if (!track) {
      throw new BadRequestException('Track not found');
    }
    if (!track.active) {
      throw new BadRequestException('Selected track is inactive');
    }
    const conflictingPlacement =
      await this.prisma.placement.findFirst({
        where: {
          studentId: dto.studentId,
          status: {
            in: ['PLANNED', 'ACTIVE'],
          },
          startDate: {
            lt: endDate,
          },
          endDate: {
            gt: startDate,
          },
        },
      });
    if (conflictingPlacement) {
      throw new BadRequestException(
        'Student already has a placement overlapping these dates',
      );
    }
    return this.prisma.placement.create({
      data: {
        studentId: dto.studentId,
        supervisorId: dto.supervisorId,
        trackId: dto.trackId,
        startDate,
        endDate,
        status: dto.status ?? 'PLANNED',
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
    });
  }
  async findAll() {
    return this.prisma.placement.findMany({
      orderBy: {
        createdAt: 'desc',
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
    });
  }
  async findOne(id: string) {
    const placement = await this.prisma.placement.findUnique({
      where: { id },
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
        reports: {
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
    });
    if (!placement) {
      throw new NotFoundException('Placement not found');
    }
    return placement;
  }
  async update(id: string, dto: UpdatePlacementDto) {
    const existing = await this.prisma.placement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Placement not found');
    }
    const startDate = dto.startDate
      ? new Date(dto.startDate)
      : existing.startDate;
    const endDate = dto.endDate
      ? new Date(dto.endDate)
      : existing.endDate;
    if (endDate <= startDate) {
      throw new BadRequestException(
        'End date must be after the start date',
      );
    }
    return this.prisma.placement.update({
      where: { id },
      data: {
        studentId: dto.studentId,
        supervisorId: dto.supervisorId,
        trackId: dto.trackId,
        startDate,
        endDate,
        status: dto.status,
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
    });
  }
  async remove(id: string) {
    const existing = await this.prisma.placement.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Placement not found');
    }
    await this.prisma.placement.delete({
      where: { id },
    });
    return {
      message: 'Placement deleted successfully',
    };
  }
  async getStudentPlacement(studentUserId: string) {
    const student = await this.prisma.studentProfile.findUnique({
      where: {
        userId: studentUserId,
      },
    });
    if (!student) {
      throw new NotFoundException('Student profile not found');
    }
    return this.prisma.placement.findMany({
      where: {
        studentId: student.id,
      },
      orderBy: {
        startDate: 'desc',
      },
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
    });
  }
  async getSupervisorInterns(supervisorUserId: string) {
    const supervisor = await this.prisma.supervisorProfile.findUnique({
      where: {
        userId: supervisorUserId,
      },
    });
    if (!supervisor) {
      throw new NotFoundException('Supervisor profile not found');
    }
    return this.prisma.placement.findMany({
      where: {
        supervisorId: supervisor.id,
      },
      orderBy: {
        startDate: 'desc',
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
        track: true,
      },
    });
  }
}
