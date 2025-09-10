import { addDays, format } from 'date-fns'
import { AppState } from '@state/types'

export type WeeklySeries = {
  dates: string[]
  completionPct: number[]
  focusMinutes: number[]
}

function toDateKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export function computeWeeklySeries(state: AppState, days: number = 7): WeeklySeries {
  const today = new Date()
  const start = addDays(today, -days + 1)
  const dates: string[] = []
  const completionPct: number[] = []
  const focusMinutes: number[] = []

  for (let i = 0; i < days; i++) {
    const d = addDays(start, i)
    const key = toDateKey(d)
    dates.push(format(d, 'dd.MM.'))

    // Completion percent for the day: average of per-activity (progress/target)
    const progForDay = state.activityProgressByDate[key] || {}
    const activityPercents: number[] = state.activities.map((a) => {
      const done = progForDay[a.id] || 0
      if (a.dailyTarget <= 0) return 0
      return Math.min(1, done / a.dailyTarget)
    })
    const dayPct = activityPercents.length
      ? Math.round((activityPercents.reduce((s, x) => s + x, 0) / activityPercents.length) * 100)
      : 0
    completionPct.push(dayPct)

    // Focus minutes (sum of completed pomodoros that day)
    const focus = (state.pomodoroSessions || [])
      .filter((s) => s.date === key && s.completed)
      .reduce((sum, s) => sum + (s.durationMin || 0), 0)
    focusMinutes.push(focus)
  }

  return { dates, completionPct, focusMinutes }
}
