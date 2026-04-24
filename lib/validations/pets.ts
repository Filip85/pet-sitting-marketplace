import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['dog', 'cat', 'other']),
  breed: z.string().optional(),
  age: z.number().int().min(0).optional(),
})

export type PetForm = z.infer<typeof petSchema>