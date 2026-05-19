import { z } from 'zod'

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please choose a valid date (YYYY-MM-DD)')

export const bookingSchema = z
  .object({
    petId: z.string().uuid('Please select a pet'),
    startDate: isoDate,
    endDate: isoDate,
  })
  .refine((d) => d.endDate >= d.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  })
  .refine(
    (d) => d.startDate >= new Date().toISOString().slice(0, 10),
    { message: 'Start date cannot be in the past', path: ['startDate'] }
  )

export type BookingForm = z.infer<typeof bookingSchema>