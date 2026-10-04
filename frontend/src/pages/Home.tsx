import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Navigation */}
      <header className="border-b border-white/10 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500 font-bold">
              I
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight">InternTrack</p>
              <p className="text-xs text-slate-400">Internship Management System</p>
            </div>
          </Link>

          <Link
            to="/login"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-indigo-100"
          >
            Sign in
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.22),transparent_35%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.12),transparent_30%)]" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
            <div>
              <div className="mb-6 inline-flex items-center rounded-full border border-indigo-400/20 bg-indigo-400/10 px-4 py-2 text-sm text-indigo-200">
                ?? Smarter internship management
              </div>

              <h1 className="max-w-3xl text-5xl font-black leading-tight tracking-tight sm:text-6xl">
                Manage every step of the
                <span className="text-indigo-400"> internship journey.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                InternTrack connects students, supervisors and administrators
                in one simple platform for placements, weekly progress reports,
                feedback and cohort monitoring.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/login"
                  className="rounded-xl bg-indigo-500 px-7 py-3.5 text-center font-bold shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
                >
                  Access the portal ?
                </Link>

                <a
                  href="#features"
                  className="rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-center font-semibold text-slate-200 transition hover:bg-white/10"
                >
                  Explore features
                </a>
              </div>

              <div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-400">
                <div>
                  <p className="font-bold text-white">3</p>
                  <p>user roles</p>
                </div>

                <div>
                  <p className="font-bold text-white">Weekly</p>
                  <p>progress tracking</p>
                </div>

                <div>
                  <p className="font-bold text-white">Centralized</p>
                  <p>cohort management</p>
                </div>
              </div>
            </div>

            {/* Visual panel */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-3xl bg-indigo-500/10 blur-3xl" />

              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-2xl backdrop-blur">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Internship overview
                    </p>
                    <p className="text-xs text-slate-400">
                      Current cohort progress
                    </p>
                  </div>

                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    Active
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-slate-900/80 p-5">
                    <p className="text-xs text-slate-400">Students</p>
                    <p className="mt-2 text-3xl font-black">128</p>
                    <p className="mt-1 text-xs text-emerald-400">
                      +12 this cohort
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-900/80 p-5">
                    <p className="text-xs text-slate-400">Placements</p>
                    <p className="mt-2 text-3xl font-black">114</p>
                    <p className="mt-1 text-xs text-indigo-300">
                      89% placed
                    </p>
                  </div>

                  <div className="col-span-2 rounded-2xl bg-slate-900/80 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Weekly reports</p>
                      <p className="text-sm font-bold">82%</p>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div className="h-full w-[82%] rounded-full bg-indigo-500" />
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-slate-500">
                      <span>Submitted</span>
                      <span>Reviewed by supervisors</span>
                    </div>
                  </div>

                  <div className="col-span-2 rounded-2xl border border-indigo-400/10 bg-indigo-400/5 p-5">
                    <p className="text-xs uppercase tracking-wider text-indigo-300">
                      Platform workflow
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-xl">?????</div>
                        <p className="mt-1 text-slate-300">Student</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-xl">?????</div>
                        <p className="mt-1 text-slate-300">Supervisor</p>
                      </div>

                      <div className="rounded-lg bg-white/5 p-3">
                        <div className="text-xl">??</div>
                        <p className="mt-1 text-slate-300">Admin</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="border-t border-white/10 bg-slate-900/60">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-widest text-indigo-400">
                Built for the full internship lifecycle
              </p>

              <h2 className="mt-3 text-3xl font-black sm:text-4xl">
                One platform. Three roles. One clear workflow.
              </h2>

              <p className="mt-4 text-slate-400">
                Everything needed to coordinate students, supervisors,
                placements and weekly progress in one organized system.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              <Feature
                icon="??"
                title="Student workspace"
                text="View your placement, maintain your profile and submit weekly internship reports."
              />

              <Feature
                icon="?????"
                title="Supervisor workspace"
                text="See assigned interns, review progress reports and provide structured feedback."
              />

              <Feature
                icon="??"
                title="Admin control center"
                text="Manage users, tracks and placements while monitoring cohort progress."
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-6 py-20">
            <div className="rounded-3xl border border-indigo-400/20 bg-indigo-500/10 px-8 py-12 text-center">
              <h2 className="text-3xl font-black">
                Ready to manage your internship journey?
              </h2>

              <p className="mx-auto mt-4 max-w-xl text-slate-300">
                Sign in to access your personalized InternTrack workspace.
              </p>

              <Link
                to="/login"
                className="mt-7 inline-flex rounded-xl bg-white px-7 py-3.5 font-bold text-slate-950 transition hover:bg-indigo-100"
              >
                Sign in to InternTrack
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 InternTrack. Internship Management System.</p>
          <p>Built with React, TypeScript & NestJS.</p>
        </div>
      </footer>
    </div>
  )
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: string
  title: string
  text: string
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-7 transition hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">
        {icon}
      </div>

      <h3 className="mt-5 text-xl font-bold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{text}</p>
    </article>
  )
}
