'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { loginSchema, type LoginForm as LoginFormType } from '@/lib/validations/auth'
import { login } from '@/actions/login'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormType) => {
    setError(null)
    // Server action validates, signs in, sets cookies, and redirects.
    // It only returns if there's an error.
    const result = await login(data)
    if (result?.error) setError(result.error)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="you@example.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-3 border border-gray-200 rounded-2xl bg-white/80 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full rounded-2xl">
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  )
}