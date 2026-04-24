import { z } from 'zod'

export const bookingSchema = z.object({
  petId: z.string().uuid(),
  startDate: z.string(), // or date
  endDate: z.string(),
  totalPrice: z.number().min(0),
})

export type BookingForm = z.infer<typeof bookingSchema>