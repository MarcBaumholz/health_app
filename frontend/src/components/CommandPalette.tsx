import { useEffect, useMemo, useRef, useState } from 'react'

export function CommandPalette({ actions }: { actions: { id: string; label: string; run: () => void }[] }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    setTimeout(() => inputRef.current?.focus(), 0)
    setIndex(0)
    const onKey = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
      if (e.key === 'ArrowDown') { e.preventDefault(); setIndex(i => Math.min(i + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setIndex(i => Math.max(i - 1, 0)) }
      if (e.key === 'Enter') {
        e.preventDefault()
        const a = filtered[index]
        if (a) { a.run(); setOpen(false) }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const filtered = useMemo(() => actions.filter(a => a.label.toLowerCase().includes(q.toLowerCase())), [q, actions])

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/20 flex items-start justify-center pt-24" role="dialog" aria-modal="true" aria-label="Befehlsmenü">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-teal-200 shadow-lg p-3" onClick={e=>e.stopPropagation()}>
        <input
          ref={inputRef}
          autoFocus
          placeholder="Befehl suchen…"
          value={q}
          onChange={e=>{ setQ(e.target.value); setIndex(0) }}
          className="w-full border border-teal-300 rounded-xl px-3 py-2 mb-2 outline-none focus:ring-2 focus:ring-teal-400"
          aria-label="Befehl suchen"
        />
        <div ref={listRef} className="max-h-64 overflow-auto space-y-1" role="listbox" aria-activedescendant={filtered[index]?.id || ''}>
          {filtered.map((a, i) => (
            <button
              key={a.id}
              id={a.id}
              role="option"
              aria-selected={i===index}
              onMouseEnter={() => setIndex(i)}
              onClick={()=>{ a.run(); setOpen(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg ${i===index ? 'bg-teal-50' : 'hover:bg-teal-50'}`}
            >
              {a.label}
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="px-3 py-2 text-sm text-slate-500">Keine Treffer</div>
          )}
        </div>
      </div>
    </div>
  )
}
