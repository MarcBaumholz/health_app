import { useEffect, useRef } from 'react'
import { useAppStore } from '@state/store'

export function ReminderDialog() {
  const open = useAppStore((s) => s.ui.reminderDialogOpen)
  const activityId = useAppStore((s) => s.ui.reminderDialogActivityId)
  const act = useAppStore((s) => s.activities.find((a) => a.id === activityId))
  const close = useAppStore((s) => s.closeReminder)
  const completeReminder = useAppStore((s) => s.completeReminder)
  const snooze = useAppStore((s) => s.snoozeReminder)

  const dialogRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const el = dialogRef.current
    const focusables = el?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    // set initial focus
    if (focusables && focusables[0]) {
      focusables[0].focus()
    } else if (closeBtnRef.current) {
      closeBtnRef.current.focus()
    }

    function onKey(e: KeyboardEvent) {
      if (!el) return
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      } else if (e.key === 'Tab') {
        const items = el.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!items.length) return
        const first = items[0]
        const last = items[items.length - 1]
        const active = document.activeElement as HTMLElement | null
        if (e.shiftKey) {
          if (active === first || !el.contains(active)) {
            e.preventDefault()
            ;(last as HTMLElement).focus()
          }
        } else {
          if (active === last || !el.contains(active)) {
            e.preventDefault()
            ;(first as HTMLElement).focus()
          }
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  if (!open || !activityId || !act) return null

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      onClick={close}
    >
      <div
        ref={dialogRef}
        className="bg-teal-50 text-slate-800 rounded-2xl p-6 max-w-2xl w-full shadow-lg relative outline-none"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          ref={closeBtnRef}
          aria-label="Schließen"
          className="absolute top-3 right-3 rounded-full w-8 h-8 bg-white border border-teal-200 text-slate-700"
          onClick={close}
        >
          ×
        </button>
        <div id="reminder-title" className="text-2xl font-semibold mb-3 pr-10">
          Zeit für: {act.title}
        </div>
        <div className="rounded-xl overflow-hidden bg-white mb-4">
          <img
            src={act.imageUrl || 'https://placehold.co/800x300?text=400+x+300'}
            alt="Motivation"
            className="w-full h-60 object-cover"
          />
        </div>
        <p className="mb-5 text-slate-700">
          {act.description ||
            'Eine kurze Pause entlastet deinen Geist und beugt Ermüdung vor. Steh kurz auf, streck dich oder schau aus dem Fenster.'}
        </p>
        <div className="flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded-lg bg-white border border-teal-200"
            onClick={() => snooze(activityId, 10)}
          >
            In 10 Min erinnern
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-teal-500 text-white"
            onClick={() => completeReminder(activityId)}
          >
            Ja, gemacht!
          </button>
        </div>
      </div>
    </div>
  )
}
