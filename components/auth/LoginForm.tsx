'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../../lib/supabase/client'
import { loginSchema, LoginForm as LoginFormType } from '../../lib/validations/auth'
import { Button } from '../ui/Button'
import { Form } from '../ui/Form'

export const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  })

  const navigate = async (destination: string) => {
    try {
      console.log('Attempting router.push to:', destination)
      await router.push(destination)
      console.log('router.push succeeded')
    } catch (err) {
      console.log('router.push failed, falling back to window.location.href:', destination)
      window.location.href = destination
    }
  }

  const onSubmit = async (data: LoginFormType) => {
    setLoading(true)
    setError(null)
    console.log('Login form submitted with email:', data.email)

    try {
      console.log('Calling signInWithPassword...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      console.log('signInWithPassword response:', { authData: authData ? 'user' : null, authError })

      if (authError) {
        console.log('Auth error:', authError.message)
        setError(authError.message)
        return
      }

      if (!authData.user) {
        console.log('No user returned from signInWithPassword')
        setError('Login failed. Please try again.')
        return
      }

      console.log('User authenticated:', authData.user.id)
      console.log('Fetching profile...')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()

      console.log('Profile response:', { profile, profileError })

      if (profileError || !profile) {
        console.log('Profile error:', profileError?.message)
        setError('Unable to load user profile.')
        return
      }

      const destination = profile.role === 'OWNER' ? '/owner' : profile.role === 'SITTER' ? '/sitter' : '/sitters'
      console.log('Login successful, navigating to:', destination)
      await navigate(destination)
    } catch (err) {
      console.log('Unexpected error:', err)
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
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