'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginForm as LoginFormType } from '../../lib/validations/auth'
import { Button } from '../ui/Button'
import { Form } from '../ui/Form'
import { login } from '../../actions/login'

export const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = (destination: string) => {
    try {
      router.push(destination)
    } catch (err) {
      window.location.href = destination
    }
  }

  const onSubmit = async (data: LoginFormType) => {
    setLoading(true)
    setError(null)
    const results = await login(data);

    if (results.error) {
      setError(results.error)
    } else if (results.destination) {
      navigate(results.destination)
    } else {
      setError('An unexpected error occurred')
    }
  }

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email
        </label>
        <input
          {...register('email')}
          type="email"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter your email"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <input
          {...register('password')}
          type="password"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          placeholder="Enter your password"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Signing in...' : 'Sign In'}
      </Button>
    </Form>
  )
}