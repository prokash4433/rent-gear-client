// lib/booking.ts
// Dates are "YYYY-MM-DD" strings (what <input type="date"> gives).
// Start and end dates are both counted, so 2025-01-01 -> 2025-01-01 = 1 day.

const MS_PER_DAY = 24 * 60 * 60 * 1000

function parseDate(value: string): number | null {
          if (!value) return null
          // UTC parse, so daylight-saving never changes the day count.
          const time = Date.parse(`${value}T00:00:00Z`)
          return Number.isNaN(time) ? null : time
}

/** Number of rental days, inclusive. 0 if dates are missing/invalid. */
export function rentalDays(startDate: string, endDate: string): number {
          const start = parseDate(startDate)
          const end = parseDate(endDate)
          if (start === null || end === null || end < start) return 0
          return Math.round((end - start) / MS_PER_DAY) + 1
}

/** Billing periods (Daily / Weekly / Monthly) the rental covers. */
export function rentalPeriods(
          startDate: string,
          endDate: string,
          rentalType: string
): number {
          const days = rentalDays(startDate, endDate)
          if (days === 0) return 0

          switch (String(rentalType).trim().toLowerCase()) {
                    case "weekly":
                              return Math.ceil(days / 7)
                    case "monthly":
                              return Math.ceil(days / 30)
                    case "daily":
                    default:
                              return days
          }
}

/** Total = rate x periods x quantity. 0 for invalid input. */
export function rentalTotal(
          price: number,
          startDate: string,
          endDate: string,
          rentalType: string,
          quantity: number
): number {
          if (!(price > 0) || !(quantity > 0)) return 0
          const periods = rentalPeriods(startDate, endDate, rentalType)
          return Math.round(price * periods * quantity)
}