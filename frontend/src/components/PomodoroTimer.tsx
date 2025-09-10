import { useEffect, useMemo, useState } from 'react'
import { useAppStore } from '@state/store'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, Button, Input } from '@components/ui'
import { CircularProgress } from '@components/CircularProgress'

const DURATION_MS = 25 * 60 * 1000

export function PomodoroTimer() {
  const current = useAppStore((s) => s.currentPomodoro)
  const start = useAppStore((s) => s.startPomodoro)
  const pause = useAppStore((s) => s.pausePomodoro)
  const resume = useAppStore((s) => s.resumePomodoro)
  const reset = useAppStore((s) => s.resetPomodoro)
  const tick = useAppStore((s) => s.tickPomodoro)
  const complete = useAppStore((s) => s.completePomodoro)
  const [goal, setGoal] = useState('')

  useEffect(() => {
    const id = setInterval(() => tick(1000), 1000)
    return () => clearInterval(id)
  }, [tick])

  useEffect(() => {
    if (current && current.elapsedMs >= DURATION_MS) {
      complete()
      toast.success('Pomodoro beendet!')
    }
  }, [current, complete])

  const remainingMs = current ? Math.max(0, DURATION_MS - current.elapsedMs) : DURATION_MS
  const pct = Math.round(((DURATION_MS - remainingMs) / DURATION_MS) * 100)
  const remaining = useMemo(() => {
    const left = remainingMs
    const mm = Math.floor(left / 60000)
    const ss = Math.floor((left % 60000) / 1000)
    return `${mm.toString().padStart(2, '0')}:${ss.toString().padStart(2, '0')}`
  }, [remainingMs])

  return (
    <Card>
      <CardHeader className="font-medium">Pomodoro Timer</CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative">
          <CircularProgress value={pct} size={160} barColor="#34d399" trackColor="#d1fae5" showLabel={false} />
          <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold">{remaining}</div>
        </div>
        <div className="flex-1 w-full space-y-3">
          {!current && (
            <div className="flex gap-2">
              <Input placeholder="Was ist dein Ziel für diese Sitzung?" value={goal} onChange={(e: any) => setGoal(e.target.value)} />
              <Button onClick={() => start(goal)} disabled={!goal.trim()}>Start</Button>
            </div>
          )}
          {current && (
            <div className="flex items-center gap-2">
              {current.isRunning ? (
                <Button onClick={pause}>Pause</Button>
              ) : (
                <Button onClick={resume}>Fortsetzen</Button>
              )}
              <Button onClick={reset}>Reset</Button>
              <div className="text-slate-500">Ziel: {current.goal}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
