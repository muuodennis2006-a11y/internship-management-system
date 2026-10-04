import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  GraduationCap,
  MessageSquare,
  RefreshCw,
  Send,
  UserRound,
} from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Placement, WeeklyReport } from '../types'

function formatDate(value?: string) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function statusClass(status?: string) {
  if (status === 'REVIEWED') {
    return 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
  }

  return 'border-amber-400/20 bg-amber-400/10 text-amber-300'
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

function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mb-8">
      <Link
        to="/dashboard"
        className="mb-5 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
      >
        <ArrowLeft size={16} />
        Back to dashboard
      </Link>

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
  )
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
        status,
      )}`}
    >
      {status}
    </span>
  )
}

function EmptyReports() {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
      <FileText size={28} className="mx-auto text-slate-600" />
      <p className="mt-4 font-medium text-slate-300">No weekly reports yet</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Once a weekly progress report is submitted, it will appear here.
      </p>
    </div>
  )
}

function StudentReports() {
  const { user } = useAuth()

  const [placement, setPlacement] = useState<Placement | null>(null)
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [weekNumber, setWeekNumber] = useState('1')
  const [weekStart, setWeekStart] = useState('')
  const [weekEnd, setWeekEnd] = useState('')
  const [activities, setActivities] = useState('')
  const [skillsLearned, setSkillsLearned] = useState('')
  const [challenges, setChallenges] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const [placementResult, reportResult] = await Promise.all([
        api.get<Placement | null>('/students/me/placement'),
        api.get<unknown>('/students/me/reports'),
      ])

      setPlacement(placementResult)
      setReports(unwrapArray<WeeklyReport>(reportResult))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load your reports.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const usedWeeks = useMemo(
    () => new Set(reports.map((report) => report.weekNumber)),
    [reports],
  )

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const week = Number(weekNumber)

    if (!placement) {
      setError('You need an assigned placement before submitting a report.')
      return
    }

    if (!Number.isInteger(week) || week < 1) {
      setError('Week number must be a positive number.')
      return
    }

    if (usedWeeks.has(week)) {
      setError(`Week ${week} already has a submitted report.`)
      return
    }

    if (!weekStart || !weekEnd) {
      setError('Please provide the week start and end dates.')
      return
    }

    if (new Date(weekEnd) < new Date(weekStart)) {
      setError('Week end date cannot be before the week start date.')
      return
    }

    setSubmitting(true)

    try {
      await api.post('/students/me/reports', {
        placementId: placement.id,
        weekNumber: week,
        weekStart: new Date(`${weekStart}T00:00:00`).toISOString(),
        weekEnd: new Date(`${weekEnd}T23:59:59`).toISOString(),
        activities: activities.trim(),
        skillsLearned: skillsLearned.trim(),
        challenges: challenges.trim(),
      })

      setSuccess(`Week ${week} report submitted successfully.`)

      setWeekNumber(String(week + 1))
      setWeekStart('')
      setWeekEnd('')
      setActivities('')
      setSkillsLearned('')
      setChallenges('')

      await load()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to submit the weekly report.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Student workspace"
        title="Weekly progress"
        description="Submit your internship activities and track supervisor feedback."
      />

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

      {!loading && !placement && (
        <div className="mb-6 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5 text-sm text-amber-200">
          You don't have an internship placement yet. Your administrator
          needs to assign one before you can submit weekly reports.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
              <Send size={19} />
            </div>

            <div>
              <h2 className="font-semibold">Submit weekly report</h2>
              <p className="mt-1 text-xs text-slate-500">
                Record what you worked on during the week.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="weekNumber"
                  className="mb-2 block text-sm font-medium"
                >
                  Week
                </label>

                <input
                  id="weekNumber"
                  type="number"
                  min="1"
                  required
                  value={weekNumber}
                  onChange={(event) => setWeekNumber(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="weekStart"
                  className="mb-2 block text-sm font-medium"
                >
                  Start date
                </label>

                <input
                  id="weekStart"
                  type="date"
                  required
                  value={weekStart}
                  onChange={(event) => setWeekStart(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label
                  htmlFor="weekEnd"
                  className="mb-2 block text-sm font-medium"
                >
                  End date
                </label>

                <input
                  id="weekEnd"
                  type="date"
                  required
                  value={weekEnd}
                  onChange={(event) => setWeekEnd(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            <TextArea
              id="activities"
              label="Activities completed"
              placeholder="Describe the work, tasks or responsibilities you completed this week..."
              value={activities}
              onChange={setActivities}
            />

            <TextArea
              id="skillsLearned"
              label="Skills learned"
              placeholder="What technical, professional or workplace skills did you develop?"
              value={skillsLearned}
              onChange={setSkillsLearned}
            />

            <TextArea
              id="challenges"
              label="Challenges"
              placeholder="Describe challenges you experienced and how you handled them..."
              value={challenges}
              onChange={setChallenges}
            />

            <button
              type="submit"
              disabled={submitting || !placement}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3.5 font-semibold transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw size={17} className="animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={17} />
                  Submit weekly report
                </>
              )}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <BookOpen size={19} />
              </div>

              <div>
                <h2 className="font-semibold">Report history</h2>
                <p className="mt-1 text-xs text-slate-500">
                  Submitted reports and supervisor feedback.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="rounded-xl border border-white/10 p-2 text-slate-400 transition hover:text-white disabled:opacity-50"
              aria-label="Refresh reports"
            >
              <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading reports...
            </div>
          ) : reports.length === 0 ? (
            <div className="mt-6">
              <EmptyReports />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reports
                .slice()
                .sort((a, b) => b.weekNumber - a.weekNumber)
                .map((report) => (
                  <article
                    key={report.id}
                    className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">
                          Week {report.weekNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {formatDate(report.weekStart)} —{' '}
                          {formatDate(report.weekEnd)}
                        </p>
                      </div>

                      <StatusBadge status={report.status} />
                    </div>

                    <div className="mt-5 space-y-4">
                      <ReportText
                        label="Activities"
                        value={report.activities}
                      />

                      <ReportText
                        label="Skills learned"
                        value={report.skillsLearned}
                      />

                      <ReportText
                        label="Challenges"
                        value={report.challenges}
                      />
                    </div>

                    {report.feedback && (
                      <div className="mt-5 rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
                          <MessageSquare size={16} />
                          Supervisor feedback
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {report.feedback}
                        </p>

                        {report.reviewedAt && (
                          <p className="mt-2 text-xs text-slate-500">
                            Reviewed {formatDate(report.reviewedAt)}
                            {report.reviewedBy?.name
                              ? ` by ${report.reviewedBy.name}`
                              : ''}
                          </p>
                        )}
                      </div>
                    )}
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-start gap-3">
          <UserRound size={19} className="mt-0.5 text-indigo-400" />

          <div>
            <p className="text-sm font-medium">
              {user?.name || 'Student'}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {user?.studentProfile?.studentNumber || 'Student number'} ·{' '}
              {user?.studentProfile?.programme || 'Programme'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function SupervisorReports() {
  const [reports, setReports] = useState<WeeklyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedReport, setSelectedReport] =
    useState<WeeklyReport | null>(null)
  const [feedback, setFeedback] = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [success, setSuccess] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await api.get<unknown>('/supervisors/me/reports')
      setReports(unwrapArray<WeeklyReport>(result))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to load supervisor reports.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const pending = reports.filter((report) => report.status === 'SUBMITTED')
  const reviewed = reports.filter((report) => report.status === 'REVIEWED')

  const openReview = (report: WeeklyReport) => {
    setSelectedReport(report)
    setFeedback(report.feedback || '')
    setSuccess('')
    setError('')
  }

  const submitReview = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedReport) return

    if (!feedback.trim()) {
      setError('Please enter feedback before submitting the review.')
      return
    }

    setReviewing(true)
    setError('')
    setSuccess('')

    try {
      await api.patch(
        `/supervisors/me/reports/${selectedReport.id}/review`,
        {
          feedback: feedback.trim(),
        },
      )

      setSuccess(
        `Week ${selectedReport.weekNumber} report reviewed successfully.`,
      )

      setSelectedReport(null)
      setFeedback('')

      await load()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to review this report.',
      )
    } finally {
      setReviewing(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Supervisor workspace"
        title="Weekly reports"
        description="Review submitted progress reports and provide useful feedback to your interns."
      />

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

      <div className="grid gap-4 sm:grid-cols-3">
        <ReportStat
          icon={FileText}
          label="Total reports"
          value={reports.length}
        />

        <ReportStat
          icon={Clock3}
          label="Awaiting review"
          value={pending.length}
        />

        <ReportStat
          icon={CheckCircle2}
          label="Reviewed"
          value={reviewed.length}
        />
      </div>

      <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Submitted reports</h2>
            <p className="mt-1 text-xs text-slate-500">
              Select a report to read it and provide feedback.
            </p>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {loading ? (
          <div className="mt-10 flex items-center justify-center gap-3 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" />
            Loading reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="mt-6">
            <EmptyReports />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {reports
              .slice()
              .sort((a, b) => {
                if (a.status === 'SUBMITTED' && b.status !== 'SUBMITTED') return -1
                if (a.status !== 'SUBMITTED' && b.status === 'SUBMITTED') return 1
                return b.weekNumber - a.weekNumber
              })
              .map((report) => (
                <article
                  key={report.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/30 p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">
                        {report.student?.user?.name || 'Student'}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {report.student?.studentNumber || 'Student'} · Week{' '}
                        {report.weekNumber}
                      </p>
                    </div>

                    <StatusBadge status={report.status} />
                  </div>

                  <div className="mt-5 space-y-4">
                    <ReportText
                      label="Activities"
                      value={report.activities}
                    />

                    <ReportText
                      label="Skills learned"
                      value={report.skillsLearned}
                    />

                    <ReportText
                      label="Challenges"
                      value={report.challenges}
                    />
                  </div>

                  {report.feedback && (
                    <div className="mt-5 rounded-xl border border-indigo-400/20 bg-indigo-400/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
                        Your feedback
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        {report.feedback}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => openReview(report)}
                    disabled={report.status === 'REVIEWED'}
                    className="mt-5 w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {report.status === 'REVIEWED'
                      ? 'Report already reviewed'
                      : 'Review report'}
                  </button>
                </article>
              ))}
          </div>
        )}
      </section>

      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-white/10 bg-slate-950 p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400">
                  Report review
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {selectedReport.student?.user?.name || 'Student'} · Week{' '}
                  {selectedReport.weekNumber}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelectedReport(null)}
                className="rounded-xl border border-white/10 px-3 py-2 text-sm text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>

            <div className="mt-7 space-y-5">
              <ReportText
                label="Activities completed"
                value={selectedReport.activities}
              />

              <ReportText
                label="Skills learned"
                value={selectedReport.skillsLearned}
              />

              <ReportText
                label="Challenges"
                value={selectedReport.challenges}
              />
            </div>

            <form onSubmit={submitReview} className="mt-7">
              <label
                htmlFor="feedback"
                className="mb-2 block text-sm font-medium"
              >
                Supervisor feedback
              </label>

              <textarea
                id="feedback"
                required
                rows={6}
                value={feedback}
                onChange={(event) => setFeedback(event.target.value)}
                placeholder="Provide constructive feedback about the student's progress..."
                className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
              />

              <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 hover:bg-white/[0.05]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={reviewing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold hover:bg-indigo-400 disabled:opacity-50"
                >
                  {reviewing ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Saving review...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Submit review
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function ReportStat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText
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

function TextArea({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string
  label: string
  placeholder: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium"
      >
        {label}
      </label>

      <textarea
        id={id}
        required
        rows={5}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full resize-y rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-slate-600 focus:border-indigo-400"
      />
    </div>
  )
}

function ReportText({
  label,
  value,
}: {
  label: string
  value?: string
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-300">
        {value || 'No information provided.'}
      </p>
    </div>
  )
}

export default function Reports() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <RefreshCw size={20} className="animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

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

          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
            <UserRound size={16} />
            {user.name}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
        {user.role === 'SUPERVISOR' ? (
          <SupervisorReports />
        ) : user.role === 'STUDENT' ? (
          <StudentReports />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-center">
            <BookOpen size={30} className="mx-auto text-indigo-400" />
            <h1 className="mt-4 text-2xl font-bold">
              Reports are managed through student and supervisor workspaces.
            </h1>
            <Link
              to="/dashboard"
              className="mt-6 inline-flex rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold"
            >
              Return to dashboard
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}