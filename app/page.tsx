import Link from 'next/link'

import { AppNavbar } from '@/components/layout/AppNavbar'
import { PageContainer } from '@/components/layout/PageContainer'
import { Footer } from '../components/layout/Footer'

// ─── Data ────────────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    title: 'Browse sitters',
    description:
      'Search profiles by city and price. Read bios and pick the sitter that feels right for your pet.',
  },
  {
    number: '02',
    title: 'Request a booking',
    description:
      'Choose your dates and send a request. Your sitter reviews and responds.',
  },
  {
    number: '03',
    title: 'Relax',
    description:
      'Once accepted, you’re all set. Your pet gets loving care while you’re away.',
  },
]

const FEATURES = [
  {
    icon: '✨',
    title: 'Simple & transparent',
    description:
      'Clear daily rates, easy date selection, and upfront totals — no surprises.',
    accent: 'from-blue-600 to-indigo-600',
  },
  {
    icon: '🛡️',
    title: 'Trusted profiles',
    description:
      'Sitters share experience, services, and a bio so you can book confidently.',
    accent: 'from-emerald-600 to-teal-600',
  },
  {
    icon: '💌',
    title: 'Request → confirm',
    description:
      'Send a request and get a clear ACCEPTED / REJECTED response in your dashboard.',
    accent: 'from-fuchsia-600 to-pink-600',
  },
]

const STATS = [
  { value: '200+', label: 'Sitters' },
  { value: '500+', label: 'Happy pets' },
  { value: '4.9★', label: 'Avg. rating' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AppNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-white">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/60 blur-2xl" />
          <div className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-pink-200/60 to-rose-200/60 blur-2xl" />

          <PageContainer className="pt-16 sm:pt-20 pb-16 sm:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/70 border border-white rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide text-gray-700 shadow-sm">
                  <span className="text-base" aria-hidden>🐶</span>
                  Pet-sitting marketplace
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                  Happy pets.
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    Stress-free trips.
                  </span>
                </h1>

                <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
                  Find trusted local sitters who treat your pet like family.
                  Request a booking in minutes and track status from your dashboard.
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/sitters"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors shadow-sm shadow-blue-200"
                  >
                    Find a sitter
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center bg-white/80 hover:bg-white text-gray-900 font-semibold text-sm px-7 py-3.5 rounded-2xl border border-gray-200 transition-colors"
                  >
                    Become a sitter
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 sm:gap-10">
                  {STATS.map((stat) => (
                    <div key={stat.label}>
                      <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right hero card */}
              <div className="lg:justify-self-end">
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 sm:p-10">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">Booking preview</p>
                    <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                      PENDING
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">Pet</p>
                      <p className="font-semibold text-gray-900">🐾 Buddy (Dog)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">Start</p>
                        <p className="font-semibold text-gray-900">Jun 20</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">End</p>
                        <p className="font-semibold text-gray-900">Jun 23</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                      <p className="text-xs text-blue-100">Total</p>
                      <p className="text-2xl font-extrabold">$240</p>
                      <p className="text-xs text-blue-100 mt-1">Calculated automatically from sitter rate</p>
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-gray-500">
                    This is just an example — real totals depend on sitter rate and dates.
                  </p>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Features */}
        <section className="bg-white py-14 sm:py-20">
          <PageContainer>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Why PetCare
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Everything you need, nothing you don’t
              </h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                A clean MVP experience focused on browsing, requesting, and managing bookings.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} text-white flex items-center justify-center text-xl font-bold shadow-sm`}>
                    {f.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.description}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* Steps */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-14 sm:py-20">
          <PageContainer>
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Three easy steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STEPS.map((step) => (
                <div
                  key={step.number}
                  className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white text-sm font-extrabold flex items-center justify-center">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-14 sm:py-20">
          <PageContainer>
            <div className="rounded-3xl bg-white/10 border border-white/20 p-8 sm:p-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to meet your pet’s new best friend?
              </h2>
              <p className="text-blue-100 mt-3 max-w-2xl mx-auto">
                Browse sitters, send a booking request, and manage everything from your dashboard.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/sitters"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors"
                >
                  Find a sitter
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-white/30 hover:bg-white/10 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors"
                >
                  Become a sitter
                </Link>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      <Footer />
    </div>
  )
}
