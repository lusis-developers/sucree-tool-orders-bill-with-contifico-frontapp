/**
 * Utility for handling dates in the context of Ecuador (UTC-5)
 * to avoid "off-by-one" day errors caused by UTC shifts.
 */

/**
 * Parses a date string (expected in ISO format) and returns a Date object
 * that represents the exact day and time as if it were local Ecuador time,
 * even if the browser is in a different timezone or the string is UTC.
 * 
 * If the string is just a date (T00:00:00Z), it preserves the day.
 */
export const parseECTDate = (dateStr: string): Date => {
  if (!dateStr) return new Date()

  // Create the date object
  const date = new Date(dateStr)

  // If the date is valid and we want to "fix" it for display
  // We can use the UTC methods to get the intended values
  // e.g., if dateStr is 2026-01-31T00:00:00Z, getUTCDate() is 31.
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
}

/**
 * Formats a date string to a human-readable format in EC time.
 * @param dateStr ISO Date string
 * @param includeTime Whether to include the time part
 */
export const formatECT = (dateStr: string, includeTime = true): string => {
  if (!dateStr) return 'N/A'

  const date = parseECTDate(dateStr)

  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }

  if (includeTime) {
    options.hour = '2-digit'
    options.minute = '2-digit'
  }

  return date.toLocaleString('es-EC', options)
}

/**
 * Returns the current date in Ecuador as a YYYY-MM-DD string
 */
export const getECTTodayString = (): string => {
  // Ecuador is UTC-5
  const now = new Date()
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000)
  const ecDate = new Date(utc + (3600000 * -5))

  const y = ecDate.getFullYear()
  const m = String(ecDate.getMonth() + 1).padStart(2, '0')
  const d = String(ecDate.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}
