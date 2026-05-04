import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().min(1, 'Pet name is required'),
  type: z.enum(['dog', 'cat', 'other'], {
    error: 'Please select a pet type',
  }),
  breed: z.string().optional(),
  age: z.number().int().min(0, 'Age must be 0 or greater').optional(),
})

export type PetForm = z.infer<typeof petSchema>