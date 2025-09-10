import { useEffect, useState } from 'react'

export function BreathingOverlay({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<'in'|'hold'|'out'>('in')
  const [t, setT] = useState(0)
  useEffect(() => {
    let id = setInterval(() => setT(x=>x+1), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    // box breathing 4-4-4s
    const m = t % 12
    if (m < 4) setPhase('in')
    else if (m < 8) setPhase('hold')
    else setPhase('out')
  }, [t])
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center" role="dialog" aria-modal>
      <div className="relative w-80 h-80 rounded-full bg-white/10 flex items-center justify-center">
        <div className={`transition-all duration-1000 rounded-full bg-teal-300/70 ${phase==='in'?'w-64 h-64':phase==='hold'?'w-64 h-64':'w-40 h-40'}`}></div>
        <button aria-label="Schließen" className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/80" onClick={onClose}>×</button>
      </div>
    </div>
  )
}
