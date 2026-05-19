import { z } from 'zod'

export const petSchema = z.object({
  name: z.string().trim().min(1, 'Pet name is required').max(50, 'Name is too long'),
  type: z.enum(['dog', 'cat', 'other'], {
    error: 'Please select a pet type',
  }),
  breed: z.string().trim().max(50, 'Breed name is too long').optional(),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(0, 'Age must be 0 or greater')
    .max(30, 'Age seems too high')
    .optional(),
})

export type PetForm = z.infer<typeof petSchema>