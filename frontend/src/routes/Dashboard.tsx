import { useAppStore } from '@state/store'
import { ActivityCard } from '@components/ActivityCard'
import { OverallProgress } from '@components/OverallProgress'
import { DailyGoalsCard } from '@components/DailyGoalsCard'
import { PomodoroTimer } from '@components/PomodoroTimer'
import { ReminderDialog } from '@components/ReminderDialog'
import { QuickActionBar } from '@components/QuickActionBar'
import { Button } from '@components/ui'
import { BreathingOverlay } from '@components/BreathingOverlay'

export function Dashboard() {
  const activities = useAppStore((s) => s.activities)
  const setFocus = useAppStore((s)=> (durMin:number, showBreath:boolean) => {
    const ends = new Date(Date.now() + durMin*60000).toISOString()
    const w = { start: new Date().toISOString(), end: ends }
    useAppStore.setState((st)=> ({ ...st, focusMode: { active: true, endsAt: ends, showBreath }, busyWindows: [ ...(st.busyWindows||[]), w ] }))
  })
  const fm = useAppStore((s)=> s.focusMode)
  const endFocus = useAppStore((s)=> () => {
    useAppStore.setState(st => {
      const end = st.focusMode?.endsAt
      return { ...st, focusMode: undefined, busyWindows: (st.busyWindows||[]).filter(w => w.end !== end) }
    })
  })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2"><OverallProgress /></div>
        <div className="lg:col-span-1"><DailyGoalsCard /></div>
      </div>
      
      <QuickActionBar />
      
      {/* Fokus-Buttons vorübergehend deaktiviert */}
      {/* <div className="flex items-center gap-2">
        <Button aria-label="Fokus 25 Minuten" onClick={()=>setFocus(25, true)}>Fokus 25</Button>
        <Button aria-label="Fokus 45 Minuten" onClick={()=>setFocus(45, true)}>Fokus 45</Button>
        <Button aria-label="Fokus 90 Minuten" onClick={()=>setFocus(90, true)}>Fokus 90</Button>
        {fm?.active && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-teal-700">Fokus bis {new Date(fm.endsAt).toLocaleTimeString()}</span>
            <Button aria-label="Fokus beenden" onClick={endFocus}>Beenden</Button>
          </div>
        )}
      </div> */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">Meine gesunden Gewohnheiten</h2>
          <div className="text-sm text-gray-500">
            {activities.length} Aktivitäten
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {activities.map((a) => (
            <ActivityCard key={a.id} activityId={a.id} />
          ))}
        </div>
      </div>
      <PomodoroTimer />
      <ReminderDialog />
      {fm?.active && fm.showBreath && <BreathingOverlay onClose={()=> useAppStore.setState(s=> ({ ...s, focusMode: s.focusMode ? { ...s.focusMode, showBreath: false } : s.focusMode })) } />}
    </div>
  )
}
