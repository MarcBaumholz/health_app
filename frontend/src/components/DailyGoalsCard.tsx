import { useState } from 'react'
import { useAppStore } from '@state/store'
import { toDateKey } from '@lib/date'
import { Card, CardContent, CardHeader, Button, Input } from '@components/ui'

export function DailyGoalsCard() {
  const [text, setText] = useState('')
  const goals = useAppStore((s) => s.dailyGoalsByDate[toDateKey()] || [])
  const add = useAppStore((s) => s.addDailyGoal)
  const toggle = useAppStore((s) => s.toggleDailyGoal)
  const remove = useAppStore((s) => s.removeDailyGoal)

  return (
    <Card>
      <CardHeader className="font-medium">Heutige Top 3 Ziele</CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Ziel hinzufügen"
            value={text}
            onChange={(e: any) => setText(e.target.value)}
          />
          <Button
            onClick={() => {
              if (text.trim()) add(text.trim())
              setText('')
            }}
            disabled={!text.trim() || goals.length >= 3}
          >
            Hinzufügen
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {goals.map((g) => (
            <label key={g.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${g.done ? 'opacity-70 line-through' : ''}`}>
              <input type="checkbox" checked={g.done} onChange={() => toggle(g.id)} />
              <span className="truncate">{g.text}</span>
              <button type="button" className="ml-auto text-xs text-red-400 hover:text-red-300" onClick={() => remove(g.id)}>Entfernen</button>
            </label>
          ))}
          {goals.length === 0 && <div className="text-xs text-slate-400">Füge bis zu drei Ziele hinzu.</div>}
        </div>
      </CardContent>
    </Card>
  )
}
