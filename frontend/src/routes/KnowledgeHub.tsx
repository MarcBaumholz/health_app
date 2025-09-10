import { Card, CardContent, CardHeader } from '@components/ui'

const ARTICLES = [
  { title: 'Ergonomie am Arbeitsplatz', body: 'Halte den Monitor auf Augenhöhe und nutze eine Stütze für die Lendenwirbelsäule.' },
  { title: 'Pomodoro-Technik', body: '25 Minuten Fokus, 5 Minuten Pause. Nach vier Zyklen eine längere Pause.' },
  { title: 'Mentale Gesundheit', body: 'Achtsamkeitsübungen und kurze Pausen reduzieren Stress und fördern Klarheit.' },
  { title: 'Produktivität', body: 'Priorisiere 3 Hauptziele pro Tag, eliminiere Ablenkungen.' },
]

export function KnowledgeHub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {ARTICLES.map((a) => (
        <Card key={a.title}>
          <CardHeader className="font-medium">{a.title}</CardHeader>
          <CardContent className="text-sm text-slate-700">{a.body}</CardContent>
        </Card>
      ))}
    </div>
  )
}
