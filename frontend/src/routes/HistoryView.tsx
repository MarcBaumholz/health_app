import { useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { useAppStore } from '@state/store'
import { toDateKey } from '@lib/date'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export function HistoryView() {
  const activities = useAppStore((s) => s.activities)
  const selectedId = useAppStore((s) => s.selectedHistoryActivityId) || activities[0]?.id
  const setSelected = useAppStore((s) => s.setHistorySelection)
  const byDate = useAppStore((s) => s.activityProgressByDate)

  const last7 = useMemo(() => {
    const labels: string[] = []
    const data: number[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      labels.push(key.slice(5))
      const prog = byDate[key]?.[selectedId || ''] || 0
      const target = activities.find((a) => a.id === selectedId)?.dailyTarget || 1
      data.push(Math.min(100, Math.round((prog / target) * 100)))
    }
    return { labels, data }
  }, [byDate, selectedId, activities])

  if (!activities.length) return <p>Keine Aktivitäten vorhanden.</p>

  return (
    <div className="space-y-3">
      <div className="flex gap-2 items-center">
        <span>Aktivität:</span>
        <select className="border rounded px-2 py-1" value={selectedId} onChange={(e) => setSelected(e.target.value)}>
          {activities.map((a) => (
            <option key={a.id} value={a.id}>{a.title}</option>
          ))}
        </select>
      </div>
      <Bar
        data={{
          labels: last7.labels,
          datasets: [
            { label: '% Ziel erreicht', data: last7.data, backgroundColor: 'rgba(34,197,94,0.6)' },
          ],
        }}
        options={{ scales: { y: { beginAtZero: true, max: 100 } } }}
      />
    </div>
  )
}
