import { AppState } from '@state/types'

export const ACHIEVEMENTS = {
  seven_day_streak: {
    title: '7-Tage-Streak',
    description: 'Erreiche ein Ziel 7 Tage am Stück',
  },
  focus_rookie: {
    title: 'Fokus Starter',
    description: 'Schließe 5 Pomodoro-Sitzungen ab',
  },
  focus_master: {
    title: 'Fokus Meister',
    description: 'Schließe 25 Pomodoro-Sitzungen ab',
  },
  consistency_30: {
    title: 'Konstanz 30',
    description: 'Erledige eine Aktivität 30 Mal',
  },
} as const

export function checkAndUnlock(state: AppState, onUnlock: (key: string) => void) {
  // seven_day_streak
  const anySeven = Object.values(state.streakByActivity).some((v) => v >= 7)
  if (anySeven && !state.achievements['seven_day_streak']?.unlocked) onUnlock('seven_day_streak')

  // focus counts
  const completed = state.pomodoroSessions.filter((s) => s.completed).length
  if (completed >= 5 && !state.achievements['focus_rookie']?.unlocked) onUnlock('focus_rookie')
  if (completed >= 25 && !state.achievements['focus_master']?.unlocked) onUnlock('focus_master')

  // consistency_30: sum any activity total >= 30
  const counts: Record<string, number> = {}
  for (const day of Object.values(state.activityProgressByDate)) {
    for (const [activityId, c] of Object.entries(day)) {
      counts[activityId] = (counts[activityId] || 0) + c
    }
  }
  if (Object.values(counts).some((v) => v >= 30) && !state.achievements['consistency_30']?.unlocked) {
    onUnlock('consistency_30')
  }
}
