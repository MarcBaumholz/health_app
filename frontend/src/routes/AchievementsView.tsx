import { useAppStore } from '@state/store'
import { ACHIEVEMENTS } from '@lib/achievements'

export function AchievementsView() {
  const ach = useAppStore((s) => s.achievements)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Object.entries(ACHIEVEMENTS).map(([key, meta]) => {
        const state = ach[key]
        const unlocked = !!state?.unlocked
        return (
          <div key={key} className={`rounded-2xl border p-4 ${unlocked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-white/70 border-teal-200 text-slate-500'}`} title={unlocked && state?.unlockedAt ? `Freigeschaltet am ${new Date(state.unlockedAt).toLocaleDateString()}` : ''}>
            <div className="text-2xl mb-1">{unlocked ? '🏆' : '🔒'}</div>
            <div className={`font-semibold ${unlocked ? 'text-emerald-900' : 'text-slate-600'}`}>{meta.title}</div>
            <div className="text-sm opacity-80">{meta.description}</div>
          </div>
        )
      })}
    </div>
  )
}
