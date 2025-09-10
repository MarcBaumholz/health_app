import { create } from 'zustand'
import { AppState, Activity } from './types'
import { loadState, saveState, debounce } from '@lib/storage'
import { addMinutes, daysAgoKey, toDateKey } from '@lib/date'
import { checkAndUnlock, ACHIEVEMENTS } from '@lib/achievements'
import { toast } from 'sonner'

const VERSION = 1

const defaultActivities: Activity[] = [
  { id: 'water', title: 'Wasser trinken', unit: 'Gläser', dailyTarget: 8, reminderMinutes: 60, createdAt: new Date().toISOString(), description: 'Bleib hydriert', icon: 'beaker', emoji: '💧', imageUrl: 'https://placehold.co/800x300?text=Wasser' },
  { id: 'breaks', title: 'Pausen machen', unit: 'Pausen', dailyTarget: 5, reminderMinutes: 90, createdAt: new Date().toISOString(), description: 'Augen und Körper entspannen', icon: 'pause-circle', emoji: '☕️', imageUrl: 'https://placehold.co/800x300?text=Pause' },
  { id: 'exercise', title: 'Übungen', unit: 'Einheiten', dailyTarget: 4, reminderMinutes: 120, createdAt: new Date().toISOString(), description: 'Kurze Übungen zur Auflockerung', icon: 'bolt', emoji: '🏋️', imageUrl: 'https://placehold.co/800x300?text=Uebungen' },
  { id: 'posture', title: 'Haltung anpassen', unit: 'Anpassungen', dailyTarget: 6, reminderMinutes: 60, createdAt: new Date().toISOString(), description: 'Schreibtisch hoch/runter fahren', icon: 'arrows-up-down', emoji: '🪑', imageUrl: 'https://placehold.co/800x300?text=Haltung' },
  { id: 'eyes', title: 'Augenpause', unit: 'Pausen', dailyTarget: 15, reminderMinutes: 40, createdAt: new Date().toISOString(), description: 'Nach der 20-20-20 Regel', icon: 'eye', emoji: '👀', imageUrl: 'https://placehold.co/800x300?text=Augenpause' },
  { id: 'standing', title: 'stehen arbeiten', unit: 'Mal', dailyTarget: 2, reminderMinutes: 120, createdAt: new Date().toISOString(), description: 'Eine neue benutzerdefinierte Aktivität', icon: 'arrow-up-right', emoji: '🧍', imageUrl: 'https://placehold.co/800x300?text=Stehen' },
]

type Store = AppState & {
  hydrateFromCloud: (incoming: Partial<AppState>) => void
  incrementActivity: (activityId: string) => void
  decrementActivity: (activityId: string) => void
  openReminder: (activityId: string) => void
  closeReminder: () => void
  completeReminder: (activityId: string) => void
  snoozeReminder: (activityId: string, minutes?: number) => void
  addDailyGoal: (text: string) => void
  toggleDailyGoal: (id: string) => void
  removeDailyGoal: (id: string) => void
  setJournal: (text: string) => void
  deleteJournal: (date?: DateKey) => void
  startPomodoro: (goal: string) => void
  pausePomodoro: () => void
  resumePomodoro: () => void
  tickPomodoro: (ms: number) => void
  completePomodoro: () => void
  resetPomodoro: () => void
  addActivity: (a: Omit<Activity, 'id' | 'createdAt'>) => void
  updateActivity: (id: string, patch: Partial<Activity>) => void
  deleteActivity: (id: string) => void
  resetDefaults: () => void
  setHistorySelection: (id: string) => void
  selectedHistoryActivityId?: string
  syncDayRollover: () => void
  tickNow: (now?: number) => void
}

function ensureToday(state: AppState): AppState {
  const today = toDateKey()
  if (state.lastOpenedDate === today) return state

  // new day: update streaks based on yesterday
  const yesterday = daysAgoKey(1)
  const yProg = state.activityProgressByDate[yesterday] || {}
  const newStreaks: Record<string, number> = { ...state.streakByActivity }
  for (const a of state.activities) {
    const met = (yProg[a.id] || 0) >= a.dailyTarget
    newStreaks[a.id] = met ? (newStreaks[a.id] || 0) + 1 : 0
  }

  return { ...state, lastOpenedDate: today, streakByActivity: newStreaks }
}

function initState(): AppState {
  const loaded = loadState<AppState>()
  if (loaded) return ensureToday(loaded)
  const today = toDateKey()
  const reminders = defaultActivities.map((a) => ({ activityId: a.id, nextAt: addMinutes(new Date(), a.reminderMinutes).toISOString() }))
  return {
    version: VERSION,
    lastOpenedDate: today,
    activities: defaultActivities,
    activityProgressByDate: { [today]: {} },
    streakByActivity: {},
    dailyGoalsByDate: { [today]: [] },
    pomodoroSessions: [],
    reminders,
    journalByDate: {},
    achievements: {},
    reminderAdaptive: {},
    prefs: { scheduler: { maxPerHour: 6, collisionWindowSec: 30, defaultFocusDurationMin: 25 } },
    ui: { reminderDialogOpen: false, journalDraft: '', nowMs: Date.now() },
  }
}

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)) }
function nextIntervalMinutes(state: AppState, activity: Activity): number {
  const base = activity.reminderMinutes || 60
  if (!activity.adaptive) return base
  const stat = state.reminderAdaptive?.[activity.id]
  const ema = stat?.emaMinutes
  if (!ema) return base
  return clamp(Math.round(ema), 20, 240)
}
function computeNextDue(now: Date, activity: Activity, state?: AppState): Date {
  // If reminderTimes exist, pick the next today or tomorrow
  if (activity.reminderTimes && activity.reminderTimes.length > 0) {
    const candidates: Date[] = activity.reminderTimes.map((t) => {
      const [h, m] = t.split(':').map(Number)
      const d = new Date(now)
      d.setHours(h || 0, m || 0, 0, 0)
      return d
    })
    candidates.sort((a, b) => a.getTime() - b.getTime())
    for (const d of candidates) if (d.getTime() > now.getTime()) return d
    const firstTomorrow = new Date(candidates[0])
    firstTomorrow.setDate(firstTomorrow.getDate() + 1)
    return firstTomorrow
  }
  // Fallback: interval minutes from now (adaptive if enabled)
  const minutes = state ? nextIntervalMinutes(state, activity) : activity.reminderMinutes
  return addMinutes(now, minutes)
}

export const useAppStore = create<Store>((set, get) => {
  const save = debounce(() => {
    const state = get()
    saveState(state)
    const token = localStorage.getItem('gw_token')
    if (token) {
      fetch('http://localhost:3001/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ data: state }),
        credentials: 'omit',
      }).catch(() => {})
    }
  }, 500)
  let lastTick = Date.now()
  const withSideEffects = (updater: (s: AppState) => AppState) =>
    set((s) => {
      const next = ensureToday(updater(s))
      // achievements check
      checkAndUnlock(next, (key) => {
        next.achievements[key] = { unlocked: true, unlockedAt: new Date().toISOString() }
        const meta = (ACHIEVEMENTS as any)[key]
        toast.success(meta?.title || 'Neuer Erfolg!', { description: meta?.description })
      })
      save()
      return next
    })

  return {
  ...initState(),

     hydrateFromCloud: (incoming: Partial<AppState>) =>
       set((s) => {
         const next: AppState = { ...s }
         if (incoming.version !== undefined) next.version = incoming.version
         if (incoming.lastOpenedDate) next.lastOpenedDate = incoming.lastOpenedDate
         if (incoming.activities) next.activities = incoming.activities
         if (incoming.activityProgressByDate) next.activityProgressByDate = incoming.activityProgressByDate as any
         if (incoming.streakByActivity) next.streakByActivity = incoming.streakByActivity as any
         if (incoming.dailyGoalsByDate) next.dailyGoalsByDate = incoming.dailyGoalsByDate as any
         if (incoming.pomodoroSessions) next.pomodoroSessions = incoming.pomodoroSessions as any
         if (incoming.reminders) next.reminders = incoming.reminders as any
         if (incoming.journalByDate) next.journalByDate = incoming.journalByDate as any
         if (incoming.achievements) next.achievements = incoming.achievements as any
         if (incoming.prefs) next.prefs = incoming.prefs as any
         // ui is local-only
         return ensureToday(next)
       }),

    incrementActivity: (activityId) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const prog = { ...(s.activityProgressByDate[day] || {}) }
        prog[activityId] = (prog[activityId] || 0) + 1
        const act = s.activities.find((a) => a.id === activityId)!
        const reminders = s.reminders.map((r) =>
          r.activityId === activityId ? { ...r, nextAt: computeNextDue(new Date(), act, s).toISOString() } : r
        )
        return { ...s, activityProgressByDate: { ...s.activityProgressByDate, [day]: prog }, reminders }
      }),

    decrementActivity: (activityId) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const prog = { ...(s.activityProgressByDate[day] || {}) }
        prog[activityId] = Math.max(0, (prog[activityId] || 0) - 1)
        return { ...s, activityProgressByDate: { ...s.activityProgressByDate, [day]: prog } }
      }),

    openReminder: (activityId) =>
      withSideEffects((s) => ({ ...s, ui: { ...s.ui, reminderDialogOpen: true, reminderDialogActivityId: activityId } })),

    closeReminder: () => withSideEffects((s) => ({ ...s, ui: { ...s.ui, reminderDialogOpen: false, reminderDialogActivityId: undefined } })),

    snoozeReminder: (activityId, minutes = 10) =>
      withSideEffects((s) => {
        const reminders = s.reminders.map((r) =>
          r.activityId === activityId ? { ...r, nextAt: addMinutes(new Date(), minutes).toISOString() } : r
        )
        return { ...s, reminders, ui: { ...s.ui, reminderDialogOpen: false, reminderDialogActivityId: undefined } }
      }),

    completeReminder: (activityId) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const prog = { ...(s.activityProgressByDate[day] || {}) }
        prog[activityId] = (prog[activityId] || 0) + 1
        const act = s.activities.find((a) => a.id === activityId)!

        // Adaptive update: measure latency from due time
        const dueAtIso = s.reminders.find(r => r.activityId === activityId)?.nextAt
        const dueAt = dueAtIso ? new Date(dueAtIso).getTime() : undefined
        if (act.adaptive && dueAt) {
          const now = Date.now()
          const latencyMin = Math.max(1, Math.round((now - dueAt) / 60000))
          const prev = s.reminderAdaptive?.[activityId]?.emaMinutes
          const alpha = 0.4
          const ema = prev ? (alpha * latencyMin + (1 - alpha) * prev) : latencyMin
          const nextMap = { ...(s.reminderAdaptive || {}) }
          nextMap[activityId] = { emaMinutes: ema, lastDueAt: dueAtIso }
          s.reminderAdaptive = nextMap
        }

        const reminders = s.reminders.map((r) =>
          r.activityId === activityId
            ? { ...r, nextAt: computeNextDue(new Date(), act, s).toISOString() }
            : r
        )
        return { ...s, activityProgressByDate: { ...s.activityProgressByDate, [day]: prog }, reminders, ui: { ...s.ui, reminderDialogOpen: false, reminderDialogActivityId: undefined } }
      }),

    // Journal helpers for multiple entries
    setJournal: (text) =>
      withSideEffects((s) => ({ ...s, ui: { ...s.ui, journalDraft: text } })),

    deleteJournal: (date) =>
      withSideEffects((s) => {
        const key = date || toDateKey()
        const next = { ...s.journalByDate }
        delete next[key]
        return { ...s, journalByDate: next }
      }),

    // Goals and others
    addDailyGoal: (text) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const goals = [...(s.dailyGoalsByDate[day] || [])]
        if (goals.length >= 3) return s
        goals.push({ id: crypto.randomUUID(), text, done: false })
        return { ...s, dailyGoalsByDate: { ...s.dailyGoalsByDate, [day]: goals } }
      }),

    toggleDailyGoal: (id) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const goals = (s.dailyGoalsByDate[day] || []).map((g) => (g.id === id ? { ...g, done: !g.done } : g))
        return { ...s, dailyGoalsByDate: { ...s.dailyGoalsByDate, [day]: goals } }
      }),

    removeDailyGoal: (id) =>
      withSideEffects((s) => {
        const day = toDateKey()
        const goals = (s.dailyGoalsByDate[day] || []).filter((g) => g.id !== id)
        return { ...s, dailyGoalsByDate: { ...s.dailyGoalsByDate, [day]: goals } }
      }),


    startPomodoro: (goal) =>
      withSideEffects((s) => ({ ...s, currentPomodoro: { goal, startedAt: new Date().toISOString(), elapsedMs: 0, isRunning: true } })),

    pausePomodoro: () => withSideEffects((s) => (s.currentPomodoro ? { ...s, currentPomodoro: { ...s.currentPomodoro, isRunning: false } } : s)),

    resumePomodoro: () => withSideEffects((s) => (s.currentPomodoro ? { ...s, currentPomodoro: { ...s.currentPomodoro, isRunning: true } } : s)),

    tickPomodoro: (ms) =>
      set((s) => (s.currentPomodoro && s.currentPomodoro.isRunning ? { ...s, currentPomodoro: { ...s.currentPomodoro, elapsedMs: s.currentPomodoro.elapsedMs + ms } } : s)),

    completePomodoro: () =>
      withSideEffects((s) => {
        if (!s.currentPomodoro) return s
        const day = toDateKey()
        const session = {
          id: crypto.randomUUID(),
          date: day,
          goal: s.currentPomodoro.goal,
          startedAt: s.currentPomodoro.startedAt,
          durationMin: 25,
          completed: true,
        }
        return { ...s, currentPomodoro: undefined, pomodoroSessions: [...s.pomodoroSessions, session] }
      }),

    resetPomodoro: () => set((s) => ({ ...s, currentPomodoro: undefined })),

    addActivity: (a) =>
      withSideEffects((s) => {
        const newA: Activity = { ...a, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
        const reminders = [...s.reminders, { activityId: newA.id, nextAt: addMinutes(new Date(), newA.reminderMinutes).toISOString() }]
        return { ...s, activities: [...s.activities, newA], reminders }
      }),

    updateActivity: (id, patch) =>
      withSideEffects((s) => {
        const activities = s.activities.map((x) => (x.id === id ? { ...x, ...patch } : x))
        return { ...s, activities }
      }),

    deleteActivity: (id) =>
      withSideEffects((s) => ({
        ...s,
        activities: s.activities.filter((x) => x.id !== id),
        reminders: s.reminders.filter((r) => r.activityId !== id),
      })),

    resetDefaults: () =>
    withSideEffects((_s) => {
    const today = toDateKey()
    const reminders = defaultActivities.map((a) => ({ activityId: a.id, nextAt: addMinutes(new Date(), a.reminderMinutes).toISOString() }))
    const next = {
    version: VERSION,
    lastOpenedDate: today,
    activities: defaultActivities,
    activityProgressByDate: { [today]: {} },
    streakByActivity: {},
    dailyGoalsByDate: { [today]: [] },
    pomodoroSessions: [],
    reminders,
    journalByDate: {},
    achievements: {},
    reminderAdaptive: {},
    prefs: { scheduler: { maxPerHour: 6, collisionWindowSec: 30, defaultFocusDurationMin: 25 } },
    ui: { reminderDialogOpen: false, journalDraft: '', nowMs: Date.now() },
    } as AppState
      // Also clear backend state if logged in
         const token = localStorage.getItem('gw_token')
         if (token) {
           fetch('http://localhost:3001/state', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
             body: JSON.stringify({ data: next }),
             credentials: 'omit',
           }).catch(() => {})
         }
         return next
       }),

    setHistorySelection: (id?: string) => set((s) => ({ ...s, selectedHistoryActivityId: id })),
    selectedHistoryActivityId: undefined,

    syncDayRollover: () => set((s) => ensureToday(s)),

    tickNow: (now = Date.now()) => set((s) => {
      // Check for day rollover first
      const today = toDateKey()
      const stateWithRollover = s.lastOpenedDate !== today ? ensureToday(s) : s
      
      const next: any = { ...stateWithRollover, ui: { ...stateWithRollover.ui, nowMs: now } }
      
      // Repair missing reminders → ensure one per activity
      const existing = new Set((stateWithRollover.reminders||[]).map(r => r.activityId))
      const missing = stateWithRollover.activities.filter(a => !existing.has(a.id))
      if (missing.length) {
        const repaired = missing.map(a => ({ activityId: a.id, nextAt: computeNextDue(new Date(now), a, stateWithRollover).toISOString() }))
        next.reminders = [...(stateWithRollover.reminders||[]), ...repaired]
      }
      if (stateWithRollover.focusMode?.active && new Date(stateWithRollover.focusMode.endsAt).getTime() <= now) {
        // end focus → clear busy window matching it
        next.focusMode = undefined
        next.busyWindows = (stateWithRollover.busyWindows||[]).filter(w => w.end !== stateWithRollover.focusMode?.endsAt)
      }
      return next
    }),
  }
})
