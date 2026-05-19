import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    role: z.enum(['OWNER', 'SITTER']),
    city: z.string().trim().optional(),
    bio: z.string().trim().optional(),
    pricePerDay: z.number().positive('Price must be greater than 0').optional(),
  })
  .refine(
    (data) => data.role !== 'SITTER' || (data.pricePerDay !== undefined && data.pricePerDay > 0),
    { message: 'Price per day is required for sitters', path: ['pricePerDay'] }
  )

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>