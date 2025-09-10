import { useEffect, useState } from 'react'
import { Dashboard } from './Dashboard'
import { AuthPage } from './Auth'
import { KnowledgeHub } from './KnowledgeHub'
import { ProfilePage } from './Profile'
import { WeeklyReviewPage } from './WeeklyReview'
import { HistoryView } from './HistoryView'
import { JournalView } from './JournalView'
import { AchievementsView } from './AchievementsView'
import { SettingsView } from './SettingsView'
import { Toaster } from 'sonner'
import { useAppStore } from '@state/store'
import { AiAssistantPage } from './Assistant'
import { getToken } from '@state/auth'
import { CommandPalette } from '@components/CommandPalette'
import { startSensing, isFaceDetectorAvailable } from '@lib/sensing'
import { hydrateJournalFromIdb } from '@state/journal'

import { strings, getLang, setLang } from '@routes/../i18n'
const tabs = [
  { key: 'dashboard', labelKey: 'dashboard', component: <Dashboard /> },
  { key: 'assistant', labelKey: 'assistant', component: <AiAssistantPage /> },
  { key: 'wissen', labelKey: 'wissen', component: <KnowledgeHub /> },
  { key: 'wochenreview', labelKey: 'wochenreview', component: <WeeklyReviewPage /> },
  { key: 'verlauf', labelKey: 'verlauf', component: <HistoryView /> },
  { key: 'journal', labelKey: 'journal', component: <JournalView /> },
  { key: 'erfolge', labelKey: 'erfolge', component: <AchievementsView /> },
  { key: 'einstellungen', labelKey: 'einstellungen', component: <SettingsView /> },
  { key: 'profil', labelKey: 'profil', component: <ProfilePage /> },
]

type TabKey = typeof tabs[number]['key']

export function App() {
  const [active, setActive] = useState<TabKey>('dashboard')
  const syncDayRollover = useAppStore((s) => s.syncDayRollover)
  useEffect(() => {
    document.title = 'GesundWerk'
    hydrateJournalFromIdb()
    // Midnight reset
    function schedule() {
      const now = new Date()
      const next = new Date(now)
      next.setHours(24, 0, 0, 0)
      const ms = next.getTime() - now.getTime()
      return setTimeout(() => {
        syncDayRollover()
        schedule()
      }, ms)
    }
    const t = schedule()
    // Single global tick
    const tick = setInterval(() => {
      useAppStore.getState().tickNow(Date.now())
      const s = useAppStore.getState()
      const now = Date.now()
      // Backend scheduling temporarily disabled (client-only reminders)
      // const token = getToken()
      // if (token && (now % 10_000 < 1000)) {
      //   const day = new Date().toISOString().slice(0,10)
      //   const prog = s.activityProgressByDate[day] || {}
      //   fetch('http://localhost:8000/schedule', {
      //     method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, credentials: 'omit',
      //     body: JSON.stringify({ reminders: s.reminders, activities: s.activities.map(a=>({ id: a.id, dailyTarget: a.dailyTarget, progressToday: prog[a.id]||0 })), lastShownAt: s.ui.lastReminderShownMs || 0, busy: (s.busyWindows||[]), prefs: s.prefs || {} })
      //   }).then(r=>r.json()).then(js => { if (js && js.reminders) { useAppStore.setState(st => ({ ...st, reminders: js.reminders })) } }).catch(()=>{})
      // }
      const due = s.reminders.find((r) => new Date(r.nextAt).getTime() <= now)
      if (due && !s.ui.reminderDialogOpen) {
        // Throttle: prevent 2 popups within 60s
        if (s.ui.lastReminderShownMs && now - s.ui.lastReminderShownMs < 60_000) return
        // Busy windows check disabled; always allow
        // If Pomodoro is running, skip snooze (reverted)
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          const act = s.activities.find(a => a.id === due.activityId)
          navigator.serviceWorker.controller.postMessage({ type: 'notify', title: 'Erinnerung fällig', body: 'Zeit für: ' + (act?.title || 'Aktivität'), data: { activityId: due.activityId } })
        }
        s.openReminder(due.activityId)
        useAppStore.setState((st) => ({ ...st, ui: { ...st.ui, lastReminderShownMs: now } }))
      }
    }, 1000)
    return () => { clearTimeout(t); clearInterval(tick) }
  }, [syncDayRollover])

  useEffect(() => {
    // Smart Sensing opt-in
    if (!isFaceDetectorAvailable()) return
    const consent = localStorage.getItem('gw_sensing')
    if (consent !== 'yes') return
    const stop = startSensing(() => {
      // Away detected → log a break
      const breaks = useAppStore.getState().activities.find(a=>a.id==='breaks')
      if (breaks) useAppStore.getState().incrementActivity('breaks')
    })
    return () => { stop && stop() }
  }, [])
  // Simple client gate: show auth if no token exists
  const token = typeof window !== 'undefined' ? getToken() : null
  if (!token) {
    return (
      <div className="max-w-6xl mx-auto p-4">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">GesundWerk</h1>
        </header>
        <AuthPage onAuth={() => window.location.reload()} />
      </div>
    )
  }
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (e) => {
        const msg = e.data || {}
        if (msg.type === 'openReminder' && msg.activityId) {
          useAppStore.getState().openReminder(msg.activityId)
        }
      })
    }
    // On app load after login, hydrate from cloud state
    const token = getToken()
    if (token) {
      import('@lib/config').then(({ apiGet }) => {
        apiGet('state', token)
          .then(json => json && json.data && useAppStore.getState().hydrateFromCloud(json.data))
          .catch(() => {})
      })
    }
  }, [])
  return (
    <div className="max-w-6xl mx-auto p-4">
      <Toaster richColors position="top-right" />
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">GesundWerk</h1>
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <span>Local-first Wohlbefinden</span>
          {isFaceDetectorAvailable() && (
            <button onClick={()=>{
              const cur = localStorage.getItem('gw_sensing')==='yes'
              const next = cur ? 'no':'yes'
              localStorage.setItem('gw_sensing', next)
              window.location.reload()
            }} className="px-3 py-1 rounded-full border border-teal-300">
              Sensing: {localStorage.getItem('gw_sensing')==='yes'?'AN':'AUS'}
            </button>
          )}
          <button onClick={()=>{ const cur = getLang(); const next = cur==='de'?'en':'de'; setLang(next); setActive('dashboard'); }} className="px-3 py-1 rounded-full border border-teal-300">{getLang().toUpperCase()}</button>
          <span className="hidden sm:inline">{localStorage.getItem('gw_email') || ''}</span>
        </div>
      </header>
      <nav className="flex flex-wrap gap-2 bg-white/70 rounded-full p-2 border border-teal-200 shadow-sm">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActive(t.key as TabKey)}
            className={`px-4 py-1.5 rounded-full border transition ${active === t.key ? 'bg-teal-100 border-teal-300 text-teal-900' : 'bg-transparent border-transparent text-slate-600 hover:bg-teal-50'}`}
          >
            {strings[getLang()][t.labelKey]}
          </button>
        ))}
      </nav>
      <div className="mt-4">
        {tabs.find(t => t.key === active)?.component}
      </div>
      <CommandPalette actions={[
        { id: 'start-p25', label: 'Fokus 25m', run: ()=> useAppStore.getState().startPomodoro('Fokus 25') },
        { id: 'start-p45', label: 'Fokus 45m', run: ()=> useAppStore.getState().startPomodoro('Fokus 45') },
        { id: 'start-p90', label: 'Fokus 90m', run: ()=> useAppStore.getState().startPomodoro('Fokus 90') },
        { id: 'tab-dashboard', label: 'Tab: Dashboard', run: ()=> setActive('dashboard') },
        { id: 'tab-assistant', label: 'Tab: Assistent', run: ()=> setActive('assistant') },
        { id: 'tab-wissen', label: 'Tab: Wissen', run: ()=> setActive('wissen') },
        { id: 'tab-wochenreview', label: 'Tab: Wochenreview', run: ()=> setActive('wochenreview') },
        { id: 'tab-verlauf', label: 'Tab: Verlauf', run: ()=> setActive('verlauf') },
        { id: 'tab-journal', label: 'Tab: Journal', run: ()=> setActive('journal') },
        { id: 'tab-erfolge', label: 'Tab: Erfolge', run: ()=> setActive('erfolge') },
        { id: 'tab-settings', label: 'Tab: Einstellungen', run: ()=> setActive('einstellungen') },
        { id: 'tab-profile', label: 'Tab: Profil', run: ()=> setActive('profil') },
      ]} />
    </div>
  )
}
