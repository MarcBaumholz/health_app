import { useAppStore } from '@state/store'
import { toDateKey } from '@lib/date'
import { Card, CardContent, CardHeader } from '@components/ui'
import { CircularProgress } from '@components/CircularProgress'

export function OverallProgress() {
  const activities = useAppStore((s) => s.activities)
  const prog = useAppStore((s) => s.activityProgressByDate[toDateKey()] || {})
  const pct = activities.length
    ? Math.round(
        (activities.reduce((sum, a) => sum + Math.min(1, (prog[a.id] || 0) / a.dailyTarget), 0) / activities.length) * 100
      )
    : 0

  const totalTarget = activities.reduce((sum, a) => sum + a.dailyTarget, 0)
  const totalDone = activities.reduce((sum, a) => sum + (prog[a.id] || 0), 0)

  return (
    <Card>
      <CardContent className="flex flex-col items-center md:flex-row md:items-start gap-4">
        <CircularProgress value={pct} />
        <div className="text-center md:text-left">
          <div className="text-sky-700 text-sm mb-1">↗ Du hast {pct}% deiner Tagesziele erreicht.</div>
          <div className="text-lg"><strong>{totalDone}</strong> von <strong>{totalTarget}</strong> Aktivitäten abgeschlossen. Weiter so!</div>
        </div>
      </CardContent>
    </Card>
  )
}
