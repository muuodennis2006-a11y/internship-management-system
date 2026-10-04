import { useEffect, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'

type Student = {
  id: string
  studentNumber: string
  programme: string
  department: string
  phone?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

type Supervisor = {
  id: string
  department: string
  organization?: string
  phone?: string
  user?: {
    id: string
    name: string
    email: string
  }
}

type Track = {
  id: string
  name: string
  description?: string
  active: boolean
}

type Placement = {
  id: string
  startDate: string
  endDate: string
  status: string
  student?: {
    studentNumber: string
    user?: {
      name: string
    }
  }
  supervisor?: {
    user?: {
      name: string
    }
  }
  track?: {
    name: string
  }
}

function unwrapArray<T>(value: unknown): T[] {
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

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Users
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        <Icon size={19} />
      </div>

      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  )
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
        <Icon size={19} />
      </div>

      <p className="mt-4 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = true,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>

      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-200">
        {label}
      </label>

      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-indigo-400"
      >
        {children}
      </select>
    </div>
  )
}

export default function Admin() {
  const { user, loading: authLoading } = useAuth()

  const [students, setStudents] = useState<Student[]>([])
  const [supervisors, setSupervisors] = useState<Supervisor[]>([])
  const [tracks, setTracks] = useState<Track[]>([])
  const [placements, setPlacements] = useState<Placement[]>([])

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeSection, setActiveSection] = useState('overview')

  const [supervisorName, setSupervisorName] = useState('')
  const [supervisorEmail, setSupervisorEmail] = useState('')
  const [supervisorPassword, setSupervisorPassword] = useState('')
  const [supervisorDepartment, setSupervisorDepartment] = useState('')
  const [supervisorOrganization, setSupervisorOrganization] = useState('')
  const [supervisorPhone, setSupervisorPhone] = useState('')

  const [trackName, setTrackName] = useState('')
  const [trackDescription, setTrackDescription] = useState('')

  const [placementStudent, setPlacementStudent] = useState('')
  const [placementSupervisor, setPlacementSupervisor] = useState('')
  const [placementTrack, setPlacementTrack] = useState('')
  const [placementStart, setPlacementStart] = useState('')
  const [placementEnd, setPlacementEnd] = useState('')

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [
        studentsResult,
        supervisorsResult,
        tracksResult,
        placementsResult,
      ] = await Promise.all([
        api.get<unknown>('/admin/students'),
        api.get<unknown>('/admin/supervisors'),
        api.get<unknown>('/admin/tracks'),
        api.get<unknown>('/admin/placements'),
      ])

      setStudents(unwrapArray<Student>(studentsResult))
      setSupervisors(unwrapArray<Supervisor>(supervisorsResult))
      setTracks(unwrapArray<Track>(tracksResult))
      setPlacements(unwrapArray<Placement>(placementsResult))
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load administrator data.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadData()
    }
  }, [user])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }

  const createSupervisor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    setBusy(true)

    try {
      await api.post('/admin/supervisors', {
        name: supervisorName.trim(),
        email: supervisorEmail.trim(),
        password: supervisorPassword,
        department: supervisorDepartment.trim(),
        organization: supervisorOrganization.trim() || undefined,
        phone: supervisorPhone.trim() || undefined,
      })

      setSuccess('Supervisor created successfully.')

      setSupervisorName('')
      setSupervisorEmail('')
      setSupervisorPassword('')
      setSupervisorDepartment('')
      setSupervisorOrganization('')
      setSupervisorPhone('')

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create supervisor.',
      )
    } finally {
      setBusy(false)
    }
  }

  const createTrack = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    setBusy(true)

    try {
      await api.post('/admin/tracks', {
        name: trackName.trim(),
        description: trackDescription.trim() || undefined,
        active: true,
      })

      setSuccess('Track created successfully.')

      setTrackName('')
      setTrackDescription('')

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create track.',
      )
    } finally {
      setBusy(false)
    }
  }

  const createPlacement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    clearMessages()
    setBusy(true)

    try {
      await api.post('/admin/placements', {
        studentId: placementStudent,
        supervisorId: placementSupervisor,
        trackId: placementTrack,
        startDate: new Date(`${placementStart}T00:00:00`).toISOString(),
        endDate: new Date(`${placementEnd}T23:59:59`).toISOString(),
        status: 'PLANNED',
      })

      setSuccess('Placement created successfully.')

      setPlacementStudent('')
      setPlacementSupervisor('')
      setPlacementTrack('')
      setPlacementStart('')
      setPlacementEnd('')

      await loadData()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to create placement.',
      )
    } finally {
      setBusy(false)
    }
  }

  const updatePlacementStatus = async (
    placement: Placement,
    status: string,
  ) => {
    clearMessages()
    setBusy(true)

    try {
      await api.patch(`/admin/placements/${placement.id}`, {
        status,
      })

      setSuccess('Placement status updated successfully.')
      await loadData()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update placement status.',
      )
    } finally {
      setBusy(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <RefreshCw size={20} className="animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />
  }

  const activePlacements = placements.filter(
    (placement) => placement.status === 'ACTIVE',
  )

  const plannedPlacements = placements.filter(
    (placement) => placement.status === 'PLANNED',
  )

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500">
              <GraduationCap size={21} />
            </div>

            <div>
              <p className="font-bold">InternTrack</p>
              <p className="text-[11px] text-slate-500">
                Internship Management System
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-sm text-slate-400">
            <ShieldCheck size={17} className="text-indigo-400" />
            Administrator
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="mt-5">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-400">
              Administration
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Manage internship cohort
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Manage students, supervisors, tracks and internship placements
              from one central workspace.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-300">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat
            icon={Users}
            label="Students"
            value={students.length}
          />

          <Stat
            icon={UserRound}
            label="Supervisors"
            value={supervisors.length}
          />

          <Stat
            icon={ClipboardList}
            label="Tracks"
            value={tracks.length}
          />

          <Stat
            icon={BriefcaseBusiness}
            label="Active placements"
            value={activePlacements.length}
          />
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] p-2">
          {[
            ['overview', 'Overview'],
            ['students', 'Students'],
            ['supervisors', 'Supervisors'],
            ['tracks', 'Tracks'],
            ['placements', 'Placements'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveSection(key)}
              className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition ${
                activeSection === key
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}

          <button
            type="button"
            onClick={loadData}
            disabled={loading || busy}
            className="ml-auto rounded-xl border border-white/10 p-2.5 text-slate-400 hover:text-white disabled:opacity-50"
            aria-label="Refresh administrator data"
          >
            <RefreshCw
              size={17}
              className={loading ? 'animate-spin' : ''}
            />
          </button>
        </div>

        {activeSection === 'overview' && (
          <section className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={ClipboardList}
                title="Placement overview"
                description="Current state of internship placements."
              />

              <div className="mt-6 space-y-4">
                <OverviewRow
                  label="Total placements"
                  value={placements.length}
                />

                <OverviewRow
                  label="Active placements"
                  value={activePlacements.length}
                />

                <OverviewRow
                  label="Planned placements"
                  value={plannedPlacements.length}
                />

                <OverviewRow
                  label="Completed placements"
                  value={
                    placements.filter(
                      (placement) => placement.status === 'COMPLETED',
                    ).length
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={Users}
                title="Cohort snapshot"
                description="Quick view of the people and tracks in the system."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <MiniCard label="Students" value={students.length} />
                <MiniCard label="Supervisors" value={supervisors.length} />
                <MiniCard label="Tracks" value={tracks.length} />
                <MiniCard label="Placements" value={placements.length} />
              </div>
            </div>
          </section>
        )}

        {activeSection === 'students' && (
          <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <SectionHeader
              icon={Users}
              title="Students"
              description="Students registered in the internship cohort."
            />

            <div className="mt-6 overflow-x-auto">
              {students.length === 0 ? (
                <EmptyState text="No students found." />
              ) : (
                <table className="w-full min-w-[700px] text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                      <th className="pb-3 pr-4">Student</th>
                      <th className="pb-3 pr-4">Student number</th>
                      <th className="pb-3 pr-4">Programme</th>
                      <th className="pb-3 pr-4">Department</th>
                      <th className="pb-3">Phone</th>
                    </tr>
                  </thead>

                  <tbody>
                    {students.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="py-4 pr-4">
                          <p className="font-medium">
                            {student.user?.name || '—'}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {student.user?.email || '—'}
                          </p>
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-300">
                          {student.studentNumber}
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-400">
                          {student.programme}
                        </td>

                        <td className="py-4 pr-4 text-sm text-slate-400">
                          {student.department}
                        </td>

                        <td className="py-4 text-sm text-slate-400">
                          {student.phone || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </section>
        )}

        {activeSection === 'supervisors' && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={UserRound}
                title="Supervisors"
                description="Supervisors responsible for reviewing interns."
              />

              <div className="mt-6 space-y-3">
                {supervisors.length === 0 ? (
                  <EmptyState text="No supervisors found." />
                ) : (
                  supervisors.map((supervisor) => (
                    <div
                      key={supervisor.id}
                      className="rounded-xl border border-white/10 bg-slate-950/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {supervisor.user?.name || '—'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {supervisor.user?.email || '—'}
                          </p>
                        </div>

                        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                          Supervisor
                        </span>
                      </div>

                      <div className="mt-4 grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                        <span>{supervisor.department}</span>
                        <span>{supervisor.organization || 'No organization'}</span>
                        <span>{supervisor.phone || 'No phone'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={Plus}
                title="Add supervisor"
                description="Create a supervisor account for the cohort."
              />

              <form onSubmit={createSupervisor} className="mt-6 space-y-4">
                <Field
                  label="Full name"
                  value={supervisorName}
                  onChange={setSupervisorName}
                  placeholder="Jane Supervisor"
                />

                <Field
                  label="Email"
                  type="email"
                  value={supervisorEmail}
                  onChange={setSupervisorEmail}
                  placeholder="supervisor@example.com"
                />

                <Field
                  label="Temporary password"
                  type="password"
                  value={supervisorPassword}
                  onChange={setSupervisorPassword}
                  placeholder="Minimum 8 characters"
                />

                <Field
                  label="Department"
                  value={supervisorDepartment}
                  onChange={setSupervisorDepartment}
                  placeholder="Information Technology"
                />

                <Field
                  label="Organization"
                  value={supervisorOrganization}
                  onChange={setSupervisorOrganization}
                  placeholder="Company / Institution"
                  required={false}
                />

                <Field
                  label="Phone"
                  value={supervisorPhone}
                  onChange={setSupervisorPhone}
                  placeholder="0712345678"
                  required={false}
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                >
                  {busy ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )}
                  Create supervisor
                </button>
              </form>
            </div>
          </section>
        )}

        {activeSection === 'tracks' && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={ClipboardList}
                title="Internship tracks"
                description="Tracks used when assigning students to placements."
              />

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {tracks.length === 0 ? (
                  <EmptyState text="No tracks found." />
                ) : (
                  tracks.map((track) => (
                    <div
                      key={track.id}
                      className="rounded-xl border border-white/10 bg-slate-950/30 p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold">{track.name}</h3>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs ${
                            track.active
                              ? 'bg-emerald-400/10 text-emerald-300'
                              : 'bg-slate-400/10 text-slate-500'
                          }`}
                        >
                          {track.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-500">
                        {track.description || 'No description provided.'}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={Plus}
                title="Add track"
                description="Create a new internship specialization."
              />

              <form onSubmit={createTrack} className="mt-6 space-y-4">
                <Field
                  label="Track name"
                  value={trackName}
                  onChange={setTrackName}
                  placeholder="Software Development"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Description
                  </label>

                  <textarea
                    rows={5}
                    value={trackDescription}
                    onChange={(event) =>
                      setTrackDescription(event.target.value)
                    }
                    placeholder="Describe the internship specialization..."
                    className="w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                >
                  {busy ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )}
                  Create track
                </button>
              </form>
            </div>
          </section>
        )}

        {activeSection === 'placements' && (
          <section className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={Plus}
                title="Create placement"
                description="Assign a student to a supervisor and internship track."
              />

              <form onSubmit={createPlacement} className="mt-6 space-y-4">
                <SelectField
                  label="Student"
                  value={placementStudent}
                  onChange={setPlacementStudent}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.user?.name || 'Student'} · {student.studentNumber}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Supervisor"
                  value={placementSupervisor}
                  onChange={setPlacementSupervisor}
                >
                  <option value="">Select supervisor</option>
                  {supervisors.map((supervisor) => (
                    <option key={supervisor.id} value={supervisor.id}>
                      {supervisor.user?.name || 'Supervisor'}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Track"
                  value={placementTrack}
                  onChange={setPlacementTrack}
                >
                  <option value="">Select track</option>
                  {tracks
                    .filter((track) => track.active)
                    .map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                </SelectField>

                <Field
                  label="Start date"
                  type="date"
                  value={placementStart}
                  onChange={setPlacementStart}
                />

                <Field
                  label="End date"
                  type="date"
                  value={placementEnd}
                  onChange={setPlacementEnd}
                />

                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 font-semibold hover:bg-indigo-400 disabled:opacity-50"
                >
                  {busy ? (
                    <RefreshCw size={17} className="animate-spin" />
                  ) : (
                    <BriefcaseBusiness size={17} />
                  )}
                  Create placement
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
              <SectionHeader
                icon={BriefcaseBusiness}
                title="Placements"
                description="Monitor and update student internship assignments."
              />

              <div className="mt-6 space-y-3">
                {placements.length === 0 ? (
                  <EmptyState text="No placements found." />
                ) : (
                  placements.map((placement) => (
                    <div
                      key={placement.id}
                      className="rounded-xl border border-white/10 bg-slate-950/30 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold">
                            {placement.student?.user?.name || 'Student'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {placement.student?.studentNumber || '—'}
                          </p>
                        </div>

                        <select
                          value={placement.status}
                          disabled={busy}
                          onChange={(event) =>
                            updatePlacementStatus(
                              placement,
                              event.target.value,
                            )
                          }
                          className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white outline-none"
                        >
                          <option value="PLANNED">PLANNED</option>
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </div>

                      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <p className="text-xs text-slate-600">Supervisor</p>
                          <p className="mt-1 text-slate-300">
                            {placement.supervisor?.user?.name || '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">Track</p>
                          <p className="mt-1 text-slate-300">
                            {placement.track?.name || '—'}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-600">Period</p>
                          <p className="mt-1 text-slate-300">
                            {formatDate(placement.startDate)} —{' '}
                            {formatDate(placement.endDate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

function OverviewRow({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-950/30 px-4 py-3">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}

function MiniCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-950/30 p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-slate-500">
      {text}
    </div>
  )
}