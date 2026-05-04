import Link from 'next/link'
import { Navbar } from '../components/layout/Navbar'
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
    title: 'Book a stay',
    description:
      'Choose your dates and send a booking request. Your sitter confirms and you\'re all set.',
  },
  {
    number: '03',
    title: 'Relax & enjoy',
    description:
      'Drop off your pet and go. Your sitter keeps them happy, safe, and loved while you\'re away.',
  },
]

const FEATURES = [
  {
    icon: '🐾',
    title: 'Vetted sitters',
    description:
      'Every sitter builds a public profile with their experience, services, and daily rate — so you always know who\'s caring for your pet.',
  },
  {
    icon: '📅',
    title: 'Flexible stays',
    description:
      'One night or two weeks — find the right sitter for any schedule, with transparent pricing and no hidden fees.',
  },
  {
    icon: '💬',
    title: 'Easy booking',
    description:
      'Send a request, get confirmed, and manage everything from one simple dashboard built for pet owners.',
  },
]

const STATS = [
  { value: '200+', label: 'Sitters available' },
  { value: '500+', label: 'Pets cared for' },
  { value: '4.9★', label: 'Average rating' },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      <main className="flex-1 pt-16">

        <section className="bg-gradient-to-b from-blue-50 to-white">
          <div className="max-w-4xl mx-auto px-4 pt-24 pb-20 text-center">

            <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-8">
              Pet-sitting marketplace
            </span>

            <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight mb-6">
              Your pet deserves<br />
              <span className="text-blue-600">the best care.</span>
            </h1>

            <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
              Connect with trusted local sitters who treat your pet like their own.
              Simple booking, transparent pricing, total peace of mind.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sitters"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors shadow-sm shadow-blue-200"
              >
                Find a sitter
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-800 font-semibold text-sm px-8 py-3.5 rounded-xl border border-gray-200 transition-colors"
              >
                Become a sitter
              </Link>
            </div>

            {/* Trust stats */}
            <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
              {STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-24">
          <div className="max-w-6xl mx-auto px-4">

            {/* Section header */}
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Booked in three simple steps
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {STEPS.map((step) => (
                <div key={step.number} className="relative text-center">
                  {/* Step number circle */}
                  <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mx-auto mb-5">
                    {step.number}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gray-50 py-24">
          <div className="max-w-6xl mx-auto px-4">

            {/* Section header */}
            <div className="text-center mb-16">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-3">
                Why PetCare
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Everything your pet needs
              </h2>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col gap-4"
                >
                  <span className="text-3xl" aria-hidden="true">
                    {feature.icon}
                  </span>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-blue-600 py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to find the perfect sitter?
            </h2>
            <p className="text-blue-100 mb-10 leading-relaxed">
              Join hundreds of pet owners who trust PetCare for reliable,
              affordable, and loving pet care.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sitters"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-600 font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors"
              >
                Find a sitter
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center border border-white/40 hover:bg-blue-700 text-white font-semibold text-sm px-8 py-3.5 rounded-xl transition-colors"
              >
                Become a sitter
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}
