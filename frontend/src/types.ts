export type Role = 'STUDENT' | 'SUPERVISOR' | 'ADMIN'

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: Role
  studentProfile?: {
    id: string
    studentNumber: string
    programme: string
    department: string
    phone?: string | null
  } | null
  supervisorProfile?: {
    id: string
    department: string
    organization?: string | null
    phone?: string | null
  } | null
}

export interface Placement {
  id: string
  startDate: string
  endDate: string
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  student?: {
    id: string
    studentNumber: string
    programme: string
    department: string
    user?: {
      name: string
      email: string
    }
  }
  supervisor?: {
    id: string
    department: string
    organization?: string | null
    user?: {
      name: string
      email: string
    }
  }
  track?: {
    id: string
    name: string
    description?: string | null
  }
}

export interface WeeklyReport {
  id: string
  placementId: string
  weekNumber: number
  weekStart: string
  weekEnd: string
  activities: string
  skillsLearned: string
  challenges: string
  status: 'SUBMITTED' | 'REVIEWED'
  feedback?: string | null
  reviewedAt?: string | null
  createdAt?: string
  updatedAt?: string
  student?: {
    studentNumber?: string
    programme?: string
    user?: {
      name?: string
      email?: string
    }
  }
  placement?: Placement
  reviewedBy?: {
    name?: string
  } | null
}

export interface Student {
  id: string
  name: string
  email: string
  role: Role
  studentProfile?: {
    id: string
    studentNumber: string
    programme: string
    department: string
    phone?: string | null
  } | null
}

export interface Supervisor {
  id: string
  name: string
  email: string
  role: Role
  supervisorProfile?: {
    id: string
    department: string
    organization?: string | null
    phone?: string | null
  } | null
}

export interface Track {
  id: string
  name: string
  description?: string | null
  active: boolean
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  access_token?: string
  accessToken?: string
}