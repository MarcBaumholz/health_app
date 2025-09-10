import { useAppStore } from '@state/store'
import { toDateKey } from '@lib/date'
import { Card, CardContent, CardHeader, Button, Textarea, Input } from '@components/ui'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { appendTodayEntry } from '@state/journal'

export function JournalView() {
  const todayKey = toDateKey()
  const draft = useAppStore((s) => s.ui.journalDraft || '')
  const setJournal = useAppStore((s) => s.setJournal)
  const deleteJournal = useAppStore((s) => s.deleteJournal)
  const all = useAppStore((s) => s.journalByDate)

  const [filter, setFilter] = useState('')

  const pastKeys = useMemo(() => Object.keys(all)
    .filter((k) => (all[k] || '').trim().length > 0) // show all saved entries including today
    .sort()
    .reverse()
    .filter((k) => !filter || (all[k] || '').toLowerCase().includes(filter.toLowerCase())), [all, filter])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="font-medium">Heutiger Eintrag</CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            placeholder="Wofür bist du heute dankbar? Welche Erkenntnisse hattest du?"
            value={draft}
            onChange={(e: any) => setJournal(e.target.value)}
          />
          <div className="flex gap-2">
            <Button onClick={() => { if (appendTodayEntry()) toast.success('Eintrag gespeichert'); }} disabled={!draft?.trim()}>Speichern</Button>
            {all[todayKey]?.length ? <Button onClick={() => { deleteJournal(); toast.success('Heutige Einträge gelöscht'); }}>Löschen</Button> : null}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div className="font-medium">Vergangene Einträge</div>
        <Input placeholder="Suche (Text enthält…)" className="w-64" value={filter} onChange={(e: any) => setFilter(e.target.value)} />
      </div>

      {pastKeys.length === 0 && <div className="text-slate-500 text-sm">Keine Einträge</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {pastKeys.map((k) => (
          <Card key={k}>
            <CardHeader className="text-sm text-slate-500">{k === todayKey ? `Heute (${k})` : k}</CardHeader>
            <CardContent className="text-sm whitespace-pre-wrap">{all[k]}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
