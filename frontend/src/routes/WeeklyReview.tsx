import { Card, CardContent, CardHeader } from '@components/ui'
import { useAppStore } from '@state/store'
import { computeWeeklySeries } from '@lib/analytics'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useMemo, useState } from 'react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export function WeeklyReviewPage() {
  const state = useAppStore((s) => s)
  const [range, setRange] = useState<7|30>(7)
  const data = useMemo(() => computeWeeklySeries(state, range), [state, range])

  const completionChart = {
    labels: data.dates,
    datasets: [
      { label: 'Erfüllung %', data: data.completionPct, borderColor: '#14b8a6', backgroundColor: 'rgba(20,184,166,0.2)' },
    ],
  }
  const focusChart = {
    labels: data.dates,
    datasets: [
      { label: 'Fokus (Minuten)', data: data.focusMinutes, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.2)' },
    ],
  }

  function importBusyIcs(text: string) {
    // Minimal ICS VEVENT DTSTART/DTEND parse
    const lines = text.split(/\r?\n/)
    const windows: { start: string; end: string }[] = []
    let cur: any = null
    const parse = (v: string) => new Date(v.replace('Z','').replace(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/, '$1-$2-$3T$4:$5:$6Z')).toISOString()
    for (const l of lines) {
      if (l.startsWith('BEGIN:VEVENT')) cur = {}
      else if (l.startsWith('DTSTART:') && cur) cur.start = parse(l.slice(8))
      else if (l.startsWith('DTEND:') && cur) cur.end = parse(l.slice(6))
      else if (l.startsWith('END:VEVENT') && cur && cur.start && cur.end) {
        windows.push({ start: cur.start, end: cur.end }); cur = null
      }
    }
    useAppStore.setState((s) => ({ ...s, busyWindows: windows }))
  }

  async function getSummary() {
    const payload = {
      completion: data.completionPct,
      focus: data.focusMinutes,
      labels: data.dates,
    }
    const resp = await fetch('http://localhost:3001/weekly_summary', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    })
    const js = await resp.json()
    return js.summary as string
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <span className="text-sm text-slate-500">Zeitraum:</span>
        <button className={`px-3 py-1 rounded-full border ${range===7?'bg-teal-100 border-teal-300':'border-slate-200'}`} onClick={()=>setRange(7)}>7 Tage</button>
        <button className={`px-3 py-1 rounded-full border ${range===30?'bg-teal-100 border-teal-300':'border-slate-200'}`} onClick={()=>setRange(30)}>30 Tage</button>
      </div>

      <Card>
        <CardHeader className="font-medium">Erfüllung der Gewohnheiten</CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-500">Arbeitskalender importieren (ICS) → Reminders während Busy-Zeiten stumm</div>
            <label className="px-3 py-1 rounded-full border border-teal-300 bg-teal-100 cursor-pointer">
              ICS importieren
              <input type="file" accept="text/calendar,.ics" className="hidden" onChange={(e: any) => {
                const f = e.target.files?.[0]
                if (!f) return
                const r = new FileReader()
                r.onload = () => importBusyIcs(String(r.result || ''))
                r.readAsText(f)
              }} />
            </label>
          </div>
          <Line data={completionChart} options={{ responsive: true, plugins: { legend: { display: true }}}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-medium">Fokuszeit</CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-500">Exportiere Pomodoro-Sessions als ICS</div>
            <button
              className="px-3 py-1 rounded-full border border-teal-300 bg-teal-100"
              onClick={() => {
                const sessions = (state.pomodoroSessions || []).filter(s => s.completed)
                const lines = [
                  'BEGIN:VCALENDAR',
                  'VERSION:2.0',
                  'PRODID:-//GesundWerk//Pomodoro//DE',
                ]
                for (const s of sessions) {
                  const start = new Date(s.startedAt)
                  const end = new Date(start.getTime() + (s.durationMin || 25) * 60000)
                  const fmt = (d: Date) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
                  lines.push('BEGIN:VEVENT')
                  lines.push('UID:' + s.id + '@gesundwerk')
                  lines.push('DTSTAMP:' + fmt(new Date()))
                  lines.push('DTSTART:' + fmt(start))
                  lines.push('DTEND:' + fmt(end))
                  lines.push('SUMMARY:Pomodoro – ' + (s.goal || 'Fokus'))
                  lines.push('END:VEVENT')
                }
                lines.push('END:VCALENDAR')
                const blob = new Blob([lines.join('\n')], { type: 'text/calendar' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'gesundwerk-pomodoro.ics'
                a.click()
                URL.revokeObjectURL(url)
              }}
            >ICS exportieren</button>
          </div>
          <Line data={focusChart} options={{ responsive: true, plugins: { legend: { display: true }}}} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="font-medium">KI Wochenrückblick</CardHeader>
        <CardContent>
          <SummaryLoader getSummary={getSummary} />
        </CardContent>
      </Card>
    </div>
  )
}

function SummaryLoader({ getSummary }: { getSummary: () => Promise<string> }) {
  const [text, setText] = useState<string>('')
  const [loading, setLoading] = useState(false)
  async function load() {
    setLoading(true)
    try { setText(await getSummary()) } finally { setLoading(false) }
  }
  return (
    <div className="space-y-3">
      <button className="px-4 py-2 rounded-full border border-teal-300 bg-teal-100" onClick={load} disabled={loading}>{loading?'Lade…':'Zusammenfassung generieren'}</button>
      {text && <div className="text-sm whitespace-pre-wrap text-slate-700">{text}</div>}
    </div>
  )
}
