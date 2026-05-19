import Link from 'next/link'

import { AppNavbar } from '@/components/layout/AppNavbar'
import { PageContainer } from '@/components/layout/PageContainer'
import { RegisterForm } from '../../../components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <AppNavbar />

      <PageContainer className="py-10 sm:py-14">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 sm:p-10">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create account</h1>
              <p className="text-gray-500">Join our pet sitting community.</p>
            </div>

            <RegisterForm />

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  )
}