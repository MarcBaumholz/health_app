import { useAppStore } from '@state/store'
import { useState } from 'react'

export function QuickActionBar() {
  const activities = useAppStore((s) => s.activities)
  const activityProgressByDate = useAppStore((s) => s.activityProgressByDate)
  const completeReminder = useAppStore((s) => s.completeReminder)
  const reminders = useAppStore((s) => s.reminders)
  const now = useAppStore((s) => s.ui.nowMs || Date.now())
  const [clickedActivity, setClickedActivity] = useState<string | null>(null)

  const handleQuickComplete = (activityId: string) => {
    // Visual feedback
    setClickedActivity(activityId)
    setTimeout(() => setClickedActivity(null), 200)
    
    // Complete the reminder (this will increment counter and reset the timer)
    completeReminder(activityId)
  }

  const getActivityProgress = (activityId: string) => {
    const today = new Date().toISOString().split('T')[0]
    return activityProgressByDate[today]?.[activityId] || 0
  }

  const getNextReminderTime = (activityId: string) => {
    const reminder = reminders.find(r => r.activityId === activityId)
    if (!reminder) return null
    
    const nextAt = new Date(reminder.nextAt).getTime()
    const timeLeft = nextAt - now
    
    if (timeLeft <= 0) return "Jetzt!"
    
    const minutes = Math.floor(timeLeft / 60000)
    const seconds = Math.floor((timeLeft % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${seconds}s`
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-800">Schnellaktionen</h3>
          <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
            {activities.length} Aktivitäten
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Klicke auf ein Symbol um eine Aktivität zu vervollständigen
        </div>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {activities.map((activity) => {
          const progress = getActivityProgress(activity.id)
          const nextTime = getNextReminderTime(activity.id)
          const isCompleted = progress >= activity.dailyTarget
          const isClicked = clickedActivity === activity.id
          
          return (
            <button
              key={activity.id}
              onClick={() => handleQuickComplete(activity.id)}
              className={`
                group relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200
                hover:shadow-lg active:scale-95 transform
                ${isClicked ? 'scale-95 bg-blue-100 border-blue-300' : ''}
                ${isCompleted 
                  ? 'bg-green-50 border-green-300 text-green-800 hover:bg-green-100' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300'
                }
              `}
              title={`${activity.title} - ${progress}/${activity.dailyTarget} ${activity.unit}${nextTime ? ` - Nächste Erinnerung: ${nextTime}` : ''}`}
            >
              <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
                {activity.emoji || '📝'}
              </span>
              <div className="flex flex-col items-center">
                <span className="text-sm font-bold">
                  {progress}/{activity.dailyTarget}
                </span>
                {nextTime && (
                  <span className="text-xs text-gray-500 font-mono">
                    {nextTime}
                  </span>
                )}
              </div>
              {isCompleted && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></div>
              )}
            </button>
          )
        })}
      </div>
      
      {activities.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-sm">Keine Aktivitäten vorhanden.</p>
          <p className="text-xs text-gray-400">Füge deine erste Aktivität hinzu!</p>
        </div>
      )}
    </div>
  )
}
