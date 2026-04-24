import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['OWNER', 'SITTER']),
  city: z.string().optional(),
  bio: z.string().optional(),
  pricePerDay: z.number().optional(),
}).refine((data) => {
  if (data.role === 'SITTER') {
    return data.pricePerDay !== undefined && data.pricePerDay > 0
  }
  return true
}, {
  message: "Price per day is required for sitters",
  path: ["pricePerDay"],
})

export type LoginForm = z.infer<typeof loginSchema>
export type RegisterForm = z.infer<typeof registerSchema>