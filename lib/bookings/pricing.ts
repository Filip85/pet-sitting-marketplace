// MVP pricing helpers for bookings

const MS_PER_DAY = 1000 * 60 * 60 * 24

function parseISODateAsUTC(date: string): Date | null {
  // Expecting HTML <input type="date"> format: YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null

  const d = new Date(`${date}T00:00:00.000Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function calculateBookingDays(startDate: string, endDate: string): number {
  const start = parseISODateAsUTC(startDate)
  const end = parseISODateAsUTC(endDate)
  if (!start || !end) return 0

  const diffDays = Math.floor((end.getTime() - start.getTime()) / MS_PER_DAY)
  // Inclusive date range: same-day booking counts as 1 day
  return diffDays >= 0 ? diffDays + 1 : 0
}

export function calculateTotalPrice(params: {
  pricePerDay: number | string
  startDate: string
  endDate: string
}): number {
  const price = typeof params.pricePerDay === 'string' ? Number(params.pricePerDay) : params.pricePerDay
  if (!Number.isFinite(price) || price < 0) return 0

  const days = calculateBookingDays(params.startDate, params.endDate)
  return days * price
}
