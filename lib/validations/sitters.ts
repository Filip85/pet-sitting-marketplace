import { z } from 'zod'

export const sitterProfileSchema = z.object({
  pricePerDay: z.number().min(0),
  yearsOfExperience: z.number().int().min(0).optional(),
  servicesOffered: z.string().optional(),
  canHostAtHome: z.boolean(),
})

export type SitterProfileForm = z.infer<typeof sitterProfileSchema>