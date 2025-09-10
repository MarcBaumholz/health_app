import { useState } from 'react'
import { useAppStore } from '@state/store'
import { Card, CardContent, CardHeader, Button, Input } from '@components/ui'
import { EmojiPicker } from '@components/EmojiPicker'

export function SettingsView() {
  const activities = useAppStore((s) => s.activities)
  const add = useAppStore((s) => s.addActivity)
  const update = useAppStore((s) => s.updateActivity)
  const remove = useAppStore((s) => s.deleteActivity)
  const reset = useAppStore((s) => s.resetDefaults)

  const [draft, setDraft] = useState({ title: '', unit: '', dailyTarget: 1, reminderMinutes: 60, emoji: '', description: '' })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="font-medium">Aktivität hinzufügen</CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                <Input placeholder="z.B. Wasser trinken" value={draft.title} onChange={(e: any) => setDraft({ ...draft, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Einheit</label>
                <Input placeholder="z.B. Gläser" value={draft.unit} onChange={(e: any) => setDraft({ ...draft, unit: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Emoji</label>
                <EmojiPicker 
                  value={draft.emoji} 
                  onChange={(emoji) => setDraft({ ...draft, emoji })} 
                  placeholder="Emoji auswählen"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagesziel</label>
                <Input placeholder="z.B. 8" type="number" value={draft.dailyTarget} onChange={(e: any) => setDraft({ ...draft, dailyTarget: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Intervall (Minuten)</label>
                <Input placeholder="z.B. 60" type="number" value={draft.reminderMinutes} onChange={(e: any) => setDraft({ ...draft, reminderMinutes: Number(e.target.value) })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Beschreibung (optional)</label>
                <Input placeholder="z.B. Bleib hydriert" value={draft.description} onChange={(e: any) => setDraft({ ...draft, description: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  if (!draft.title || !draft.unit || draft.dailyTarget <= 0) return
                  add({ 
                    title: draft.title, 
                    unit: draft.unit, 
                    dailyTarget: draft.dailyTarget, 
                    reminderMinutes: draft.reminderMinutes,
                    emoji: draft.emoji || '📝',
                    description: draft.description
                  })
                  setDraft({ title: '', unit: '', dailyTarget: 1, reminderMinutes: 60, emoji: '', description: '' })
                }}
              >
                Hinzufügen
              </Button>
              {draft.emoji && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Vorschau:</span>
                  <span className="text-2xl">{draft.emoji}</span>
                  <span>{draft.title || 'Titel'}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="font-medium">Aktivitäten</div>
        <Card>
          <CardHeader className="font-medium">Reminder-Planer</CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <label className="text-sm">Max/Std
                <Input type="number" className="ml-2 w-28" value={useAppStore.getState().prefs?.scheduler?.maxPerHour||6} onChange={(e:any)=> useAppStore.setState(s=> ({ ...s, prefs: { ...s.prefs, scheduler: { ...(s.prefs?.scheduler||{}), maxPerHour: Number(e.target.value) }}}))} />
              </label>
              <label className="text-sm">Min Abstand (s)
                <Input type="number" className="ml-2 w-28" value={useAppStore.getState().prefs?.scheduler?.collisionWindowSec||30} onChange={(e:any)=> useAppStore.setState(s=> ({ ...s, prefs: { ...s.prefs, scheduler: { ...(s.prefs?.scheduler||{}), collisionWindowSec: Number(e.target.value) }}}))} />
              </label>
              <label className="text-sm">Quiet Start
                <Input className="ml-2 w-28" placeholder="22:00" value={useAppStore.getState().prefs?.scheduler?.quietStart||''} onChange={(e:any)=> useAppStore.setState(s=> ({ ...s, prefs: { ...s.prefs, scheduler: { ...(s.prefs?.scheduler||{}), quietStart: e.target.value }}}))} />
              </label>
              <label className="text-sm">Quiet End
                <Input className="ml-2 w-28" placeholder="07:00" value={useAppStore.getState().prefs?.scheduler?.quietEnd||''} onChange={(e:any)=> useAppStore.setState(s=> ({ ...s, prefs: { ...s.prefs, scheduler: { ...(s.prefs?.scheduler||{}), quietEnd: e.target.value }}}))} />
              </label>
            </div>
          </CardContent>
        </Card>
        {activities.map((a) => (
          <Card key={a.id}>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{a.emoji || '📝'}</span>
                  <div className="flex-1">
                    <div className="font-medium">{a.title}</div>
                    {a.description && <div className="text-xs text-teal-700">{a.description}</div>}
                  </div>
                  <button className="text-red-500 text-sm" onClick={() => remove(a.id)}>Löschen</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center">
                  <div className="text-sm">
                    <label className="block mb-2 font-medium text-gray-700">Emoji</label>
                    <EmojiPicker 
                      value={a.emoji || ''} 
                      onChange={(emoji) => update(a.id, { emoji })} 
                      placeholder="Emoji auswählen"
                    />
                  </div>
                  <label className="text-sm">Ziel <Input className="ml-2 w-20" type="number" value={a.dailyTarget} onChange={(e: any) => update(a.id, { dailyTarget: Number(e.target.value) })} /></label>
                  <label className="text-sm">Einheit <Input className="ml-2 w-24" value={a.unit} onChange={(e: any) => update(a.id, { unit: e.target.value })} /></label>
                  <label className="text-sm">Intervall <Input className="ml-2 w-20" type="number" value={a.reminderMinutes} onChange={(e: any) => update(a.id, { reminderMinutes: Number(e.target.value) })} /> min</label>
                  <label className="text-sm flex items-center gap-2">Adaptiv
                    <input type="checkbox" checked={!!a.adaptive} onChange={(e) => update(a.id, { adaptive: e.currentTarget.checked })} />
                  </label>
                  <label className="text-sm">Beschreibung <Input className="ml-2 w-32" placeholder="Optional" value={a.description || ''} onChange={(e: any) => update(a.id, { description: e.target.value })} /></label>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium mb-2">Feste Erinnerungszeiten (optional)</div>
                <div className="flex flex-wrap gap-2 items-center">
                  {(a.reminderTimes || []).map((t, idx) => (
                    <span key={idx} className="px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-xs">
                      {t} <button className="ml-1 text-red-500" onClick={() => update(a.id, { reminderTimes: (a.reminderTimes || []).filter((x) => x !== t) })}>×</button>
                    </span>
                  ))}
                  <Input placeholder="HH:MM" className="w-28" onKeyDown={(e: any) => {
                    if (e.key === 'Enter') {
                      const v = e.currentTarget.value
                      if (/^\d{2}:\d{2}$/.test(v)) {
                        const set = new Set([...(a.reminderTimes || []), v])
                        update(a.id, { reminderTimes: Array.from(set).sort() })
                        e.currentTarget.value = ''
                      }
                    }
                  }} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Button onClick={reset}>Auf Standard zurücksetzen</Button>
      </div>
    </div>
  )
}
