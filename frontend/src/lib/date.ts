export function toDateKey(d: Date = new Date()): string {
  return d.toISOString().slice(0, 10)
}

export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

export function daysAgoKey(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return toDateKey(d)
}
