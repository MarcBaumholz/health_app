import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@state/store'
import { toDateKey } from '@lib/date'
import { Card, CardContent, CardHeader, Button, Progress } from '@components/ui'
import { BellIcon, FireIcon, MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/solid'
import { AppIcon } from '@components/icons'

export function ActivityCard({ activityId }: { activityId: string }) {
  const activity = useAppStore((s) => s.activities.find((a) => a.id === activityId)!)
  const progress = useAppStore((s) => (s.activityProgressByDate[toDateKey()] || {})[activityId] || 0)
  const streak = useAppStore((s) => s.streakByActivity[activityId] || 0)
  const increment = useAppStore((s) => s.incrementActivity)
  const decrement = useAppStore((s) => s.decrementActivity)
  const openReminder = useAppStore((s) => s.openReminder)
  const reminder = useAppStore((s) => s.reminders.find((r) => r.activityId === activityId))

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const msLeft = useMemo(() => {
    const next = reminder ? new Date(reminder.nextAt).getTime() : 0
    return next - now
  }, [reminder, now])

  const due = msLeft <= 0
  const mm = Math.max(0, Math.floor((msLeft / 1000) / 60)).toString().padStart(2, '0')
  const ss = Math.max(0, Math.floor((msLeft / 1000) % 60)).toString().padStart(2, '0')

  const pct = Math.min(100, Math.round((progress / activity.dailyTarget) * 100))
  const completed = progress >= activity.dailyTarget

  return (
    <Card className={`flex flex-col ${completed ? 'bg-teal-50 border-teal-300' : ''}`}>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {activity.emoji ? <span className="text-xl" aria-hidden>{activity.emoji}</span> : (activity.icon && <AppIcon name={activity.icon} className="w-5 h-5 text-slate-400" />)}
          <div>
            <div className="font-medium leading-tight">{activity.title}</div>
            <div className="text-xs text-slate-500">Ziel: {activity.dailyTarget} {activity.unit}</div>
          </div>
        </div>
        {!completed && (
          <button onClick={() => openReminder(activityId)} className={`relative inline-flex items-center justify-center rounded-full border p-1.5 hover:bg-slate-100 ${due ? 'border-red-400' : 'border-slate-300'}`}>
            <BellIcon className={`w-5 h-5 ${due ? 'text-red-500' : ''}`} />
            {due && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />}
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => decrement(activityId)}><MinusSmallIcon className="w-5 h-5" /></Button>
          <div className="min-w-[5ch] text-center font-semibold">{progress}</div>
          <Button onClick={() => increment(activityId)}><PlusSmallIcon className="w-5 h-5" /></Button>
          {!completed && <div className="ml-auto text-xs text-slate-600">{mm}:{ss}</div>}
          {completed && <span className="ml-auto text-xs font-semibold text-teal-700">Fertig</span>}
        </div>
        {!completed && <Progress value={pct} />}
        {completed && <div className="h-3 w-full rounded-full bg-emerald-200" />}
        {streak > 0 && (
          <div className="flex items-center gap-1 text-amber-600 text-sm">
            <FireIcon className="w-4 h-4" />
            <span>Streak: {streak} Tage</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
