import { Card, CardContent, CardHeader, Button, Input, Textarea } from '@components/ui'
import { useState } from 'react'
import { apiCall } from '@lib/config'

export function AiAssistantPage() {
  const [work, setWork] = useState('')
  const [posture, setPosture] = useState('')
  const [complaints, setComplaints] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{exercises?: string; posture?: string; tips?: string}>({})

  async function submit() {
    setLoading(true)
    setResult({})
    try {
      const data = await apiCall('recommendations', { work_pattern: work, posture, complaints })
      setResult(data)
    } finally { setLoading(false) }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="text-lg font-semibold">KI Gesundheitsassistent</CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Input placeholder="Arbeitsmuster" value={work} onChange={(e: any) => setWork(e.target.value)} />
            <Input placeholder="Haltung" value={posture} onChange={(e: any) => setPosture(e.target.value)} />
            <Input placeholder="Beschwerden" value={complaints} onChange={(e: any) => setComplaints(e.target.value)} />
          </div>
          <Button onClick={submit} disabled={loading || !(work && posture && complaints)}>{loading ? 'Lade…' : 'Empfehlungen holen'}</Button>
          {(result.exercises || result.posture || result.tips) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <Card><CardHeader className="font-medium">Übungen</CardHeader><CardContent>{result.exercises}</CardContent></Card>
              <Card><CardHeader className="font-medium">Haltung</CardHeader><CardContent>{result.posture}</CardContent></Card>
              <Card><CardHeader className="font-medium">Tipps</CardHeader><CardContent>{result.tips}</CardContent></Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
