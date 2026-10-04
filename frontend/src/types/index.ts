export type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN'
export interface User {
  id: string
  name: string
  email: string
  role: Role
}
export interface AuthResponse {
  accessToken: string
  user: User
}
export interface StudentProfile {
  id: string
  userId: string
  studentNumber: string
  programme: string
  department: string
  phone?: string | null
}
export interface CurrentUser extends User {
  studentProfile?: StudentProfile | null
  supervisorProfile?: {
    id: string
    department: string
    organization?: string | null
    phone?: string | null
  } | null
}
export interface Placement {
  id: string
  studentId: string
  supervisorId: string
  trackId: string
  startDate: string
  endDate: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  track?: {
    id: string
    name: string
    description?: string | null
  }
  supervisor?: {
    id: string
    user?: {
      name: string
      email: string
    }
  }
}
export interface WeeklyReport {
  id: string
  weekNumber: number
  weekStart: string
  weekEnd: string
  activities: string
  skillsLearned: string
  challenges: string
  status: 'SUBMITTED' | 'REVIEWED'
  feedback?: string | null
  reviewedAt?: string | null
}
export interface DashboardData {
  summary: {
    totalStudents: number
    totalSupervisors: number
    totalTracks: number
    totalPlacements: number
    studentsWithPlacements: number
    studentsWithoutPlacements: number
    placementRate: number
  }
  placements: {
    planned: number
    active: number
    completed: number
    cancelled: number
  }
  reports: {
    submitted: number
    reviewed: number
    total: number
    reviewRate: number
  }
  tracks: Array<{
    id: string
    name: string
    active: boolean
    placementCount: number
  }>
  recentReports: Array<{
    id: string
    weekNumber: number
    status: string
    createdAt: string
    student: {
      studentNumber: string
      user: {
        name: string
      }
    }
    placement: {
      status: string
      track: {
        name: string
      }
    }
  }>
}
