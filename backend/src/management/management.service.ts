import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
@Injectable()
export class ManagementService {
  constructor(private readonly prisma: PrismaService) {}
  async getStudents() {
    return this.prisma.studentProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        placements: {
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
          orderBy: {
            startDate: 'desc',
          },
        },
        reports: {
          select: {
            id: true,
            weekNumber: true,
            status: true,
            weekStart: true,
            weekEnd: true,
            reviewedAt: true,
          },
          orderBy: {
            weekNumber: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async createSupervisor(
    name: string,
    email: string,
    passwordHash: string,
    department: string,
    organization?: string,
    phone?: string,
  ) {
    return this.prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'SUPERVISOR',
        supervisorProfile: {
          create: {
            department,
            organization,
            phone,
          },
        },
      },
      include: {
        supervisorProfile: true,
      },
    });
  }
  async getSupervisors() {
    return this.prisma.supervisorProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        placements: {
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
            reports: {
              select: {
                id: true,
                weekNumber: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
  async createTrack(
    name: string,
    description?: string,
    active = true,
  ) {
    return this.prisma.track.create({
      data: {
        name,
        description,
        active,
      },
    });
  }
  async getTracks() {
    return this.prisma.track.findMany({
      include: {
        _count: {
          select: {
            placements: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
  }
  async updateTrack(
    id: string,
    data: {
      name?: string;
      description?: string;
      active?: boolean;
    },
  ) {
    const track = await this.prisma.track.findUnique({
      where: { id },
    });
    if (!track) {
      throw new NotFoundException('Track not found');
    }
    return this.prisma.track.update({
      where: { id },
      data,
    });
  }
  async getDashboard(query: DashboardQueryDto) {
    const studentWhere = query.department
      ? {
          department: query.department,
        }
      : undefined;
    const placementWhere = query.trackId
      ? {
          trackId: query.trackId,
        }
      : undefined;
    const [
      totalStudents,
      totalSupervisors,
      totalTracks,
      totalPlacements,
      plannedPlacements,
      activePlacements,
      completedPlacements,
      cancelledPlacements,
      submittedReports,
      reviewedReports,
      studentsWithPlacements,
      studentsWithoutPlacements,
      tracks,
      recentReports,
    ] = await Promise.all([
      this.prisma.studentProfile.count({
        where: studentWhere,
      }),
      this.prisma.supervisorProfile.count(),
      this.prisma.track.count({
        where: {
          active: true,
        },
      }),
      this.prisma.placement.count({
        where: placementWhere,
      }),
      this.prisma.placement.count({
        where: {
          ...placementWhere,
          status: 'PLANNED',
        },
      }),
      this.prisma.placement.count({
        where: {
          ...placementWhere,
          status: 'ACTIVE',
        },
      }),
      this.prisma.placement.count({
        where: {
          ...placementWhere,
          status: 'COMPLETED',
        },
      }),
      this.prisma.placement.count({
        where: {
          ...placementWhere,
          status: 'CANCELLED',
        },
      }),
      this.prisma.weeklyReport.count({
        where: {
          status: 'SUBMITTED',
          ...(query.trackId
            ? {
                placement: {
                  trackId: query.trackId,
                },
              }
            : {}),
        },
      }),
      this.prisma.weeklyReport.count({
        where: {
          status: 'REVIEWED',
          ...(query.trackId
            ? {
                placement: {
                  trackId: query.trackId,
                },
              }
            : {}),
        },
      }),
      this.prisma.studentProfile.count({
        where: {
          ...studentWhere,
          placements: {
            some: {
              ...(placementWhere ?? {}),
            },
          },
        },
      }),
      this.prisma.studentProfile.count({
        where: {
          ...studentWhere,
          placements: {
            none: {
              ...(placementWhere ?? {}),
            },
          },
        },
      }),
      this.prisma.track.findMany({
        where: {
          active: true,
          ...(query.trackId
            ? {
                id: query.trackId,
              }
            : {}),
        },
        select: {
          id: true,
          name: true,
          active: true,
          _count: {
            select: {
              placements: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      }),
      this.prisma.weeklyReport.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          weekNumber: true,
          status: true,
          createdAt: true,
          student: {
            select: {
              studentNumber: true,
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          placement: {
            select: {
              status: true,
              track: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),
    ]);
    const reportTotal = submittedReports + reviewedReports;
    const reviewRate =
      reportTotal === 0
        ? 0
        : Math.round((reviewedReports / reportTotal) * 100);
    const placementRate =
      totalStudents === 0
        ? 0
        : Math.round((studentsWithPlacements / totalStudents) * 100);
    return {
      summary: {
        totalStudents,
        totalSupervisors,
        totalTracks,
        totalPlacements,
        studentsWithPlacements,
        studentsWithoutPlacements,
        placementRate,
      },
      placements: {
        planned: plannedPlacements,
        active: activePlacements,
        completed: completedPlacements,
        cancelled: cancelledPlacements,
      },
      reports: {
        submitted: submittedReports,
        reviewed: reviewedReports,
        total: reportTotal,
        reviewRate,
      },
      tracks: tracks.map((track) => ({
        id: track.id,
        name: track.name,
        active: track.active,
        placementCount: track._count.placements,
      })),
      recentReports,
    };
  }
}
