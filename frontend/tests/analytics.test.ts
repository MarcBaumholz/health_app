import { describe, it, expect } from 'vitest'
import { computeWeeklySeries } from '../src/lib/analytics'

const baseState: any = {
  version: 1,
  activities: [
    { id: 'a', title: 'A', unit: 'u', dailyTarget: 2, reminderMinutes: 60, createdAt: new Date().toISOString() },
    { id: 'b', title: 'B', unit: 'u', dailyTarget: 4, reminderMinutes: 60, createdAt: new Date().toISOString() },
  ],
  activityProgressByDate: {},
  pomodoroSessions: [],
}

function dk(offsetDays: number) {
  const d = new Date()
  d.setDate(d.getDate() - offsetDays)
  return d.toISOString().slice(0,10)
}

describe('computeWeeklySeries', () => {
  it('computes daily completion % and focus minutes', () => {
    const s = JSON.parse(JSON.stringify(baseState))
    // today
    s.activityProgressByDate[dk(0)] = { a: 1, b: 4 } // 1/2=50%, 4/4=100% -> avg 75%
    s.pomodoroSessions.push({ id: 'p1', date: dk(0), goal: 'x', startedAt: new Date().toISOString(), durationMin: 25, completed: true })
    // yesterday
    s.activityProgressByDate[dk(1)] = { a: 2, b: 2 } // 2/2=100%, 2/4=50% -> avg 75%
    s.pomodoroSessions.push({ id: 'p2', date: dk(1), goal: 'x', startedAt: new Date().toISOString(), durationMin: 50, completed: true })

    const r = computeWeeklySeries(s, 2)
    expect(r.completionPct.length).toBe(2)
    expect(r.focusMinutes).toEqual([50, 25])
    expect(r.completionPct).toEqual([75, 75])
  })
})
