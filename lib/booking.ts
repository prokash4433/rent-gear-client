/**
 * Rental duration -> money. Shared by the booking form (live total)
 * and the checkout API route (authoritative total), so both always agree.
 */

export type BookingValues = {
  startDate: string // "yyyy-mm-dd"
  endDate: string // "yyyy-mm-dd"
  quantity: string
}

/** Days one rental period covers, per rental type. */
const periodDays: Record<string, number> = {
  Hourly: 1,
  Daily: 1,
  Weekly: 7,
  Monthly: 30,
}

/** Whole days between two "yyyy-mm-dd" dates (at least 1). */
export function rentalDays(startDate: string, endDate: string): number {
  const start = new Date(startDate).getTime()
  const end = new Date(endDate).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return 0
  const days = Math.ceil((end - start) / 86_400_000)
  return Math.max(1, days)
}

/**
 * How many paid periods the range covers. Dates have no time, so a 1-day
 * daily rental is 1 period and a 7-day weekly rental is 1 period.
 */
export function rentalPeriods(
  startDate: string,
  endDate: string,
  rentalType: string
): number {
  const days = rentalDays(startDate, endDate)
  if (days <= 0) return 0
  const daysPerPeriod = periodDays[rentalType] ?? 1
  return Math.max(1, Math.ceil(days / daysPerPeriod))
}

/** Total = price x periods x quantity, rounded to whole taka. */
export function rentalTotal(
  price: number,
  startDate: string,
  endDate: string,
  rentalType: string,
  quantity: number
): number {
  const periods = rentalPeriods(startDate, endDate, rentalType)
  if (periods <= 0 || quantity <= 0) return 0
  return Math.round(price * periods * quantity)
}
