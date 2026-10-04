import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type {
  Placement,
  Student,
  Supervisor,
  Track,
  WeeklyReport,
} from '../types'

function formatDate(value?: string) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusClass(status?: string) {
  switch (status) {
    case 'ACTIVE':
    case 'REVIEWED':
      return 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20'
    case 'PLANNED':
    case 'SUBMITTED':
      return 'bg-amber-400/10 text-amber-300 border-amber-400/20'
    case 'COMPLETED':
      return 'bg-blue-400/10 text-blue-300 border-blue-400/20'
    case 'CANCELLED':
      return 'bg-red-400/10 text-red-300 border-red-400/20'
    default:
      return 'bg-slate-400/10 text-slate-300 border-slate-400/20'
  }
}

function StatCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof BarChart3
  label: string
  value: string | number
  detail: string
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Icon size={20} />
        </div>
      </div>

      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function StudentDashboard() {
  const { user } = useAuth()

  const [placement, setPlacement] = useState<Placement | null>(null)
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [placementResult, reportsResult] = await Promise.all([
        api.get<Placement | null>('/students/me/placement'),
        api.get<WeeklyReport[]>('/students/me/reports'),
      ])

      setPlacement(placementResult)
      setReports(Array.isArray(reportsResult) ? reportsResult : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const reviewed = reports.filter((report) => report.status === 'REVIEWED').length

  return (
    <>
      <DashboardHeader
        eyebrow="Student workspace"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Student'}`}
        description="Track your placement and keep your weekly internship progress up to date."
        onRefresh={load}
        loading={loading}
      />

      {error && <ErrorBox message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BriefcaseBusiness}
          label="Placement"
          value={placement ? 'Assigned' : 'Pending'}
          detail={placement?.status || 'Awaiting placement'}
        />

        <StatCard
          icon={BookOpen}
          label="Weekly reports"
          value={reports.length}
          detail={`${reviewed} reviewed by supervisor`}
        />

        <StatCard
          icon={CheckCircle2}
          label="Reviewed"
          value={reviewed}
          detail="Reports with supervisor feedback"
        />

        <StatCard
          icon={Clock3}
          label="Programme"
          value={user?.studentProfile?.department || '—'}
          detail={user?.studentProfile?.programme || 'Student profile'}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <SectionTitle
            icon={BriefcaseBusiness}
            title="My placement"
            subtitle="Current internship assignment"
          />

          {loading ? (
            <LoadingState />
          ) : placement ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <InfoItem
                label="Track"
                value={placement.track?.name || 'Not specified'}
              />
              <InfoItem
                label="Supervisor"
                value={placement.supervisor?.user?.name || 'Not specified'}
              />
              <InfoItem
                label="Start date"
                value={formatDate(placement.startDate)}
              />
              <InfoItem
                label="End date"
                value={formatDate(placement.endDate)}
              />

              <div className="sm:col-span-2">
                <span
                  className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                    placement.status,
                  )}`}
                >
                  {placement.status}
                </span>
              </div>
            </div>
          ) : (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No placement assigned yet"
              message="Your administrator will assign your internship placement."
            />
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <SectionTitle
            icon={UserRound}
            title="My profile"
            subtitle="Your registered student information"
          />

          <div className="mt-6 space-y-4">
            <InfoItem label="Full name" value={user?.name || '—'} />
            <InfoItem label="Email" value={user?.email || '—'} />
            <InfoItem
              label="Student number"
              value={user?.studentProfile?.studentNumber || '—'}
            />
            <InfoItem
              label="Department"
              value={user?.studentProfile?.department || '—'}
            />
            <InfoItem
              label="Programme"
              value={user?.studentProfile?.programme || '—'}
            />
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <SectionTitle
          icon={BookOpen}
          title="Weekly progress"
          subtitle="Your submitted internship reports"
        />

        {loading ? (
          <LoadingState />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No reports yet"
            message="Your weekly reports will appear here after submission."
          />
        ) : (
          <div className="mt-5 space-y-3">
            {reports
              .slice()
              .sort((a, b) => b.weekNumber - a.weekNumber)
              .map((report) => (
                <div
                  key={report.id}
                  className="flex flex-col gap-3 rounded-xl border border-white/10 bg-slate-950/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">Week {report.weekNumber}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDate(report.weekStart)} — {formatDate(report.weekEnd)}
                    </p>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                      report.status,
                    )}`}
                  >
                    {report.status}
                  </span>
                </div>
              ))}
          </div>
        )}
      </section>
    </>
  )
}

function SupervisorDashboard() {
  const { user } = useAuth()

  const [interns, setInterns] = useState<unknown[]>([])
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [internResult, reportResult] = await Promise.all([
        api.get<unknown>('/supervisors/me/interns'),
        api.get<WeeklyReport[]>('/supervisors/me/reports'),
      ])

      setInterns(
        Array.isArray(internResult)
          ? internResult
          : Array.isArray(
                (internResult as { data?: unknown[] } | null)?.data,
              )
            ? ((internResult as { data: unknown[] }).data)
            : [],
      )

      setReports(Array.isArray(reportResult) ? reportResult : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pending = reports.filter((report) => report.status === 'SUBMITTED').length
  const reviewed = reports.filter((report) => report.status === 'REVIEWED').length

  return (
    <>
      <DashboardHeader
        eyebrow="Supervisor workspace"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Supervisor'}`}
        description="Monitor assigned interns, review weekly progress and provide feedback."
        onRefresh={load}
        loading={loading}
      />

      {error && <ErrorBox message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={UsersRound}
          label="Assigned interns"
          value={interns.length}
          detail="Students under your supervision"
        />

        <StatCard
          icon={BookOpen}
          label="Reports received"
          value={reports.length}
          detail="Weekly reports submitted"
        />

        <StatCard
          icon={Clock3}
          label="Awaiting review"
          value={pending}
          detail="Reports requiring attention"
        />

        <StatCard
          icon={CheckCircle2}
          label="Reviewed"
          value={reviewed}
          detail="Reports already reviewed"
        />
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <SectionTitle
          icon={BookOpen}
          title="Reports requiring attention"
          subtitle="Latest weekly progress from your interns"
        />

        {loading ? (
          <LoadingState />
        ) : reports.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No reports submitted"
            message="Reports from your assigned interns will appear here."
          />
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[650px] text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Week</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {reports
                  .slice()
                  .sort((a, b) => b.weekNumber - a.weekNumber)
                  .map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="px-4 py-4">
                        <p className="font-medium">
                          {report.student?.user?.name || 'Student'}
                        </p>
                        <p className="text-xs text-slate-500">
                          {report.student?.studentNumber || '—'}
                        </p>
                      </td>

                      <td className="px-4 py-4 text-sm">
                        Week {report.weekNumber}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-400">
                        {formatDate(report.createdAt)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                            report.status,
                          )}`}
                        >
                          {report.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  )
}

function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [studentResult, supervisorResult, trackResult, placementResult] =
        await Promise.all([
          api.get<unknown>('/admin/students'),
          api.get<unknown>('/admin/supervisors'),
          api.get<unknown>('/admin/tracks'),
          api.get<unknown>('/admin/placements'),
        ])

      const unwrap = <T,>(value: unknown): T[] => {
        if (Array.isArray(value)) return value as T[]

        if (
          value &&
          typeof value === 'object' &&
          'data' in value &&
          Array.isArray((value as { data: unknown }).data)
        ) {
          return (value as { data: T[] }).data
        }

        return []
      }

      setStudents(unwrap<Student>(studentResult))
      setSupervisors(unwrap<Supervisor>(supervisorResult))
      setTracks(unwrap<Track>(trackResult))
      setPlacements(unwrap<Placement>(placementResult))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const activePlacements = placements.filter(
    (placement) => placement.status === 'ACTIVE',
  ).length

  const plannedPlacements = placements.filter(
    (placement) => placement.status === 'PLANNED',
  ).length

  return (
    <>
      <DashboardHeader
        eyebrow="Administrator workspace"
        title="Cohort overview"
        description="Manage students, supervisors, tracks and internship placements."
        onRefresh={load}
        loading={loading}
      />

      {error && <ErrorBox message={error} />}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={GraduationCap}
          label="Students"
          value={students.length}
          detail="Registered students"
        />

        <StatCard
          icon={ShieldCheck}
          label="Supervisors"
          value={supervisors.length}
          detail="Registered supervisors"
        />

        <StatCard
          icon={BriefcaseBusiness}
          label="Placements"
          value={placements.length}
          detail={`${activePlacements} active · ${plannedPlacements} planned`}
        />

        <StatCard
          icon={BarChart3}
          label="Active tracks"
          value={tracks.filter((track) => track.active).length}
          detail={`${tracks.length} tracks configured`}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <SectionTitle
            icon={GraduationCap}
            title="Students"
            subtitle="Current student cohort"
          />

          {loading ? (
            <LoadingState />
          ) : students.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No students found"
              message="Registered students will appear here."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {students.slice(0, 6).map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/30 p-4"
                >
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {student.studentProfile?.studentNumber || student.email}
                    </p>
                  </div>

                  <ChevronRight size={17} className="text-slate-600" />
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <SectionTitle
            icon={BriefcaseBusiness}
            title="Recent placements"
            subtitle="Internship assignment overview"
          />

          {loading ? (
            <LoadingState />
          ) : placements.length === 0 ? (
            <EmptyState
              icon={BriefcaseBusiness}
              title="No placements yet"
              message="Create placements from the administrator tools."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {placements.slice(0, 6).map((placement) => (
                <div
                  key={placement.id}
                  className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium">
                        {placement.student?.user?.name || 'Student'}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {placement.track?.name || 'Track not specified'}
                      </p>
                    </div>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                        placement.status,
                      )}`}
                    >
                      {placement.status}
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    {formatDate(placement.startDate)} —{' '}
                    {formatDate(placement.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  )
}

function DashboardHeader({
  eyebrow,
  title,
  description,
  onRefresh,
  loading,
}: {
  eyebrow: string
  title: string
  description: string
  onRefresh: () => void
  loading: boolean
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] disabled:opacity-50"
      >
        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
        Refresh
      </button>
    </div>
  )
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof BookOpen
  title: string
  subtitle: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-slate-600">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-slate-200">{value}</p>
    </div>
  )
}

function LoadingState() {
  return (
    <div className="mt-6 flex items-center gap-3 text-sm text-slate-500">
      <RefreshCw size={17} className="animate-spin" />
      Loading live data...
    </div>
  )
}

function EmptyState({
  icon: Icon,
  title,
  message,
}: {
  icon: typeof BookOpen
  title: string
  message: string
}) {
  return (
    <div className="mt-6 rounded-xl border border-dashed border-white/10 p-7 text-center">
      <Icon size={24} className="mx-auto text-slate-600" />
      <p className="mt-3 text-sm font-medium text-slate-300">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs leading-5 text-slate-500">
        {message}
      </p>
    </div>
  )
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
      <AlertCircle size={18} className="mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

function Sidebar({
  onLogout,
}: {
  onLogout: () => void
}) {
  const { user } = useAuth()

  const roleLabel =
    user?.role === 'STUDENT'
      ? 'Student'
      : user?.role === 'SUPERVISOR'
        ? 'Supervisor'
        : 'Administrator'

  return (
    <aside className="hidden w-64 shrink-0 border-r border-white/10 bg-slate-950 lg:flex lg:flex-col">
      <div className="border-b border-white/10 p-6">
        <a href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
            <GraduationCap size={21} />
          </div>

          <div>
            <p className="font-bold">InternTrack</p>
            <p className="text-[11px] text-slate-500">Management System</p>
          </div>
        </a>
      </div>

      <nav className="flex-1 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300">
          <LayoutDashboard size={18} />
          Overview
        </div>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-xl bg-white/[0.03] p-3">
          <p className="truncate text-sm font-medium">{user?.name}</p>
          <p className="mt-1 text-xs text-slate-500">{roleLabel}</p>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <LogOut size={17} />
          Sign out
        </button>
      </div>
    </aside>
  )
}

export default function Dashboard() {
  const { user, loading, logout } = useAuth()
  const [mobileMenu, setMobileMenu] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw size={20} className="animate-spin" />
          Loading InternTrack...
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  const role = user.role

  const dashboard = useMemo(() => {
    if (role === 'ADMIN') return <AdminDashboard />
    if (role === 'SUPERVISOR') return <SupervisorDashboard />
    return <StudentDashboard />
  }, [role])

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <Sidebar onLogout={logout} />

        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMobileMenu(true)}
                className="rounded-xl border border-white/10 p-2 text-slate-300 lg:hidden"
              >
                <Menu size={20} />
              </button>

              <div className="ml-auto flex items-center gap-3">
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.role}</p>
                </div>

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
                  <UserRound size={17} />
                </div>
              </div>
            </div>
          </header>

          <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
            {dashboard}
          </div>
        </main>
      </div>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileMenu(false)}
          />

          <div className="relative h-full w-72 border-r border-white/10 bg-slate-950 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
                  <GraduationCap size={21} />
                </div>

                <p className="font-bold">InternTrack</p>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenu(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-8 rounded-xl bg-indigo-500/10 px-4 py-3 text-sm font-medium text-indigo-300">
              <LayoutDashboard size={17} className="mr-2 inline" />
              Overview
            </div>

            <button
              type="button"
              onClick={logout}
              className="absolute bottom-6 left-5 right-5 flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-400 hover:bg-red-400/10 hover:text-red-300"
            >
              <LogOut size={17} />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}