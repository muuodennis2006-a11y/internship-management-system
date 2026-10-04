import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useAuth } from '../lib/auth'

export default function Login() {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!loading && user) {
    return <Navigate to="/dashboard" replace />
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(email.trim(), password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your credentials.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">

        <section className="hidden flex-col justify-between p-10 lg:flex">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500">
              <GraduationCap size={23} />
            </div>
            <div>
              <p className="font-bold">InternTrack</p>
              <p className="text-xs text-slate-400">
                Internship Management System
              </p>
            </div>
          </Link>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400">
              Secure access
            </p>

            <h1 className="text-5xl font-bold leading-tight">
              One platform for the entire internship journey.
            </h1>

            <p className="mt-6 text-lg leading-8 text-slate-400">
              Manage placements, weekly progress, supervision and cohort
              progress from one connected workspace.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ['Students', UserRound],
                ['Supervisors', ShieldCheck],
                ['Administrators', LockKeyhole],
              ].map(([label, Icon]) => {
                const ItemIcon = Icon as typeof UserRound

                return (
                  <div
                    key={String(label)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <ItemIcon size={20} className="text-indigo-400" />
                    <p className="mt-3 text-sm font-medium">
                      {String(label)}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Secure role-based internship management.
          </p>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md">

            <Link
              to="/"
              className="mb-8 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft size={16} />
              Back to home
            </Link>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-indigo-950/30 sm:p-9">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                  <LockKeyhole size={23} />
                </div>

                <h2 className="text-3xl font-bold">Welcome back</h2>

                <p className="mt-2 text-slate-400">
                  Sign in to continue to your workspace.
                </p>
              </div>

              {error && (
                <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3.5 pl-11 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-200"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                    />

                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter your password"
                      className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-3.5 pl-11 pr-12 text-white outline-none transition placeholder:text-slate-600 focus:border-indigo-400"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 hover:text-white"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl bg-indigo-500 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Signing in...' : 'Sign in'}
                </button>
              </form>

              <div className="mt-7 border-t border-white/10 pt-6">
                <p className="text-center text-xs leading-5 text-slate-500">
                  Your account access is controlled by your assigned
                  InternTrack role.
                </p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}