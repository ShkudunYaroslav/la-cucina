import { z } from 'zod'

export const reservationSchema = z.object({
  tableId: z.string().uuid('Выберите столик'),
  date: z.date(),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Некорректное время'),
  duration: z.number().min(60).max(240).default(120),
  guestCount: z.number().min(1).max(20),
  specialRequests: z.string().max(500).optional(),
})

export type ReservationInput = z.infer<typeof reservationSchema>