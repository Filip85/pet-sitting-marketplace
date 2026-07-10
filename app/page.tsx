import Link from 'next/link'
import { getTranslations } from 'next-intl/server'

import { AppNavbar } from '@/components/layout/AppNavbar'
import { PageContainer } from '@/components/layout/PageContainer'
import { Footer } from '../components/layout/Footer'

const FEATURE_META = [
  { icon: '✨', accent: 'from-blue-600 to-indigo-600', titleKey: 'features.simpleTitle' as const, descKey: 'features.simpleDesc' as const },
  { icon: '🛡️', accent: 'from-emerald-600 to-teal-600', titleKey: 'features.trustedTitle' as const, descKey: 'features.trustedDesc' as const },
  { icon: '💌', accent: 'from-fuchsia-600 to-pink-600', titleKey: 'features.requestTitle' as const, descKey: 'features.requestDesc' as const },
]

const STEP_META = [
  { number: '01', titleKey: 'steps.step1Title' as const, descKey: 'steps.step1Desc' as const },
  { number: '02', titleKey: 'steps.step2Title' as const, descKey: 'steps.step2Desc' as const },
  { number: '03', titleKey: 'steps.step3Title' as const, descKey: 'steps.step3Desc' as const },
]

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const t = await getTranslations('Home')
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <AppNavbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 via-indigo-50 to-white bg-[url('https://hips.hearstapps.com/hmg-prod/images/c33b2259-8c6b-4308-bc6f-5373d8a6600d.jpeg?crop=1.00xw:0.753xh;0,0.115xh&resize=1024:*')] bg-cover bg-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-blue-200/60 to-indigo-200/60 blur-2xl" />
          <div className="absolute -bottom-28 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-pink-200/60 to-rose-200/60 blur-2xl" />

          <PageContainer className="pt-16 sm:pt-20 pb-16 sm:pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-white/70 border border-white rounded-2xl px-4 py-2 text-xs font-semibold tracking-wide text-gray-700 shadow-sm">
                  <span className="text-base" aria-hidden>🐶</span>
                  {t('hero.badge')}
                </div>

                <h1 className="mt-6 text-5xl sm:text-6xl font-extrabold text-gray-900 leading-[1.05] tracking-tight">
                  {t('hero.title1')}
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                    {t('hero.title2')}
                  </span>
                </h1>

                <p className="mt-5 text-lg text-gray-600 leading-relaxed max-w-xl">
                  {t('hero.subtitle')}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/sitters"
                    className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors shadow-sm shadow-blue-200"
                  >
                    {t('hero.findSitter')}
                    <span aria-hidden>→</span>
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center bg-white/80 hover:bg-white text-gray-900 font-semibold text-sm px-7 py-3.5 rounded-2xl border border-gray-200 transition-colors"
                  >
                    {t('hero.becomeSitter')}
                  </Link>
                </div>

                <div className="mt-10 flex items-center gap-6 sm:gap-10">
                  {[
                    { value: '200+', label: t('hero.statSitters') },
                    { value: '500+', label: t('hero.statHappyPets') },
                    { value: '4.9★', label: t('hero.statRating') },
                  ].map((stat) => (
                    <div key={stat.label} className="hover:scale-110 transition-transform duration-200 cursor-default">
                      <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right hero card */}
              <div className="lg:justify-self-end">
                <div className="rounded-3xl bg-white border border-gray-100 shadow-sm p-8 sm:p-10 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{t('hero.bookingTitle')}</p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                      {t('hero.bookingStatus')}
                    </span>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                      <p className="text-xs text-gray-500">{t('hero.bookingPet')}</p>
                      <p className="font-semibold text-gray-900">🐾 Buddy (Dog)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{t('hero.bookingStart')}</p>
                        <p className="font-semibold text-gray-900">Jun 20</p>
                      </div>
                      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs text-gray-500">{t('hero.bookingEnd')}</p>
                        <p className="font-semibold text-gray-900">Jun 23</p>
                      </div>
                    </div>

                    <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
                      <p className="text-xs text-blue-100">{t('hero.bookingTotal')}</p>
                      <p className="text-2xl font-extrabold">$240</p>
                    </div>
                  </div>

                  <p className="mt-6 text-xs text-gray-500">{t('hero.bookingNote')}</p>
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
                {t('features.badge')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                {t('features.title')}
              </h2>
              <p className="text-gray-500 mt-3 max-w-2xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {FEATURE_META.map((f) => (
                <div
                  key={f.titleKey}
                  className="group rounded-3xl bg-white border border-gray-100 shadow-sm p-8 hover:-translate-y-2 hover:shadow-lg transition-all duration-300 cursor-default"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${f.accent} text-white flex items-center justify-center text-xl font-bold shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    {f.icon}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">{t(f.titleKey)}</h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t(f.descKey)}</p>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* Steps */}
        <section className="relative py-14 sm:py-24 overflow-hidden">
          <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover" src="/steps-bg.mp4" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

          <PageContainer className="relative z-10">
            <div className="text-center mb-12">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-300 mb-3">
                {t('steps.badge')}
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {t('steps.title')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {STEP_META.map((step) => (
                <div
                  key={step.number}
                  className="group rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm p-8 hover:bg-white/20 hover:border-white/40 hover:-translate-y-2 transition-all duration-300 cursor-default"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-500 text-white text-sm font-extrabold flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-400 transition-all duration-300">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-white">{t(step.titleKey)}</h3>
                  <p className="mt-2 text-sm text-blue-100 leading-relaxed">{t(step.descKey)}</p>
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
                {t('cta.title')}
              </h2>
              <p className="text-blue-100 mt-3 max-w-2xl mx-auto">
                {t('cta.subtitle')}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/sitters"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-blue-50 text-blue-700 font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors"
                >
                  {t('cta.findSitter')}
                  <span aria-hidden>→</span>
                </Link>
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center border border-white/30 hover:bg-white/10 text-white font-semibold text-sm px-7 py-3.5 rounded-2xl transition-colors"
                >
                  {t('cta.becomeSitter')}
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
