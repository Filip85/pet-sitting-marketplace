import { z } from 'zod'

export const sitterProfileSchema = z.object({
  pricePerDay: z
    .number()
    .positive('Price must be greater than 0')
    .max(10000, 'Price seems too high'),
  yearsOfExperience: z
    .number()
    .int('Must be a whole number')
    .min(0, 'Cannot be negative')
    .max(50, 'Seems too high')
    .optional(),
  services: z.array(z.string().trim().min(1)),
  bio: z.string().trim().max(500, 'Bio is too long').optional(),
  city: z.string().trim().max(100, 'City name is too long').optional(),
  canHostAtHome: z.boolean().optional(),
})

export type SitterProfileForm = z.infer<typeof sitterProfileSchema>
