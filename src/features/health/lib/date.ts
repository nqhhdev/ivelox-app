/** Local calendar date as YYYY-MM-DD (matches health API `date` query). */
export function localISODate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Shift YYYY-MM-DD by ±days in local calendar. */
export function shiftISODate(date: string, deltaDays: number): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() + deltaDays)
  return localISODate(dt)
}

/**
 * Midday Instant for a civil date so past-day meal/burn logs land on the
 * correct ICT day bounds used by the API.
 */
export function loggedAtForDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d, 12, 0, 0, 0).toISOString()
}

export function formatBoardDate(date: string): string {
  const [y, m, d] = date.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  const today = localISODate()
  if (date === today) return 'Today'
  if (date === shiftISODate(today, -1)) return 'Yesterday'
  return dt.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
