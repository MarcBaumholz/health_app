export type ISODate = string
export type DateKey = string // YYYY-MM-DD

export type DailyGoal = { id: string; text: string; done: boolean }

export type Activity = {
  id: string
  title: string
  unit: string
  dailyTarget: number
  reminderMinutes: number
  createdAt: ISODate
  description?: string
  icon?: string
  emoji?: string
  imageUrl?: string
  reminderTimes?: string[] // e.g. ["09:30","13:00","17:45"]
  adaptive?: boolean
}

export type PomodoroSession = {
  id: string
  date: DateKey
  goal: string
  startedAt: ISODate
  durationMin: number
  completed: boolean
}

export type Reminder = { activityId: string; nextAt: ISODate }

export type AchievementState = { unlocked: boolean; unlockedAt?: ISODate }

export type AppState = {
  version: number
  lastOpenedDate: DateKey
  activities: Activity[]
  activityProgressByDate: Record<DateKey, Record<string, number>>
  streakByActivity: Record<string, number>
  dailyGoalsByDate: Record<DateKey, DailyGoal[]>
  pomodoroSessions: PomodoroSession[]
  currentPomodoro?: {
    goal: string
    startedAt: ISODate
    elapsedMs: number
    isRunning: boolean
  }
  focusMode?: { active: boolean; endsAt: ISODate; showBreath: boolean; intensity?: 'soft'|'strict' }
  reminders: Reminder[]
  reminderAdaptive?: Record<string, { emaMinutes?: number; lastDueAt?: ISODate }>
  journalByDate: Record<DateKey, string[]>
  achievements: Record<string, AchievementState>
  busyWindows?: { start: ISODate; end: ISODate }[]
  prefs?: { scheduler?: { maxPerHour?: number; collisionWindowSec?: number; quietStart?: string; quietEnd?: string; defaultFocusDurationMin?: number } }
  ui: {
    reminderDialogOpen: boolean
    reminderDialogActivityId?: string
    journalDraft?: string
    nowMs?: number
    lastReminderShownMs?: number
  }
}
