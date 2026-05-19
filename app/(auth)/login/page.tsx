import Link from 'next/link'

import { AppNavbar } from '@/components/layout/AppNavbar'
import { PageContainer } from '@/components/layout/PageContainer'
import { LoginForm } from '../../../components/auth/LoginForm'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppNavbar />

      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome back</h1>
              <p className="text-gray-500">Sign in to your account.</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}