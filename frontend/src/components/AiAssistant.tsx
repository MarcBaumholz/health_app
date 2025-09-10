import { useState } from 'react'

export function AiAssistant() {
  const [work, setWork] = useState('')
  const [posture, setPosture] = useState('')
  const [complaints, setComplaints] = useState('')
  const [result, setResult] = useState<{exercises?: string; posture?: string; tips?: string}>({})
  const [loading, setLoading] = useState(false)

  async function submit() {
    setLoading(true)
    setResult({})
    try {
      const resp = await fetch('http://localhost:3001/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ work_pattern: work, posture, complaints })
      })
      const data = await resp.json()
      setResult(data)
    } catch (e) {
      setResult({ tips: 'Fehler beim Abrufen der Empfehlungen.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border rounded p-4">
      <div className="font-medium mb-2">KI Gesundheitsassistent</div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
        <input className="border rounded px-2 py-1" placeholder="Arbeitsmuster" value={work} onChange={(e) => setWork(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Haltung" value={posture} onChange={(e) => setPosture(e.target.value)} />
        <input className="border rounded px-2 py-1" placeholder="Beschwerden" value={complaints} onChange={(e) => setComplaints(e.target.value)} />
      </div>
      <button className="px-3 py-1 border rounded" onClick={submit} disabled={loading || !(work && posture && complaints)}>
        {loading ? 'Lade…' : 'Empfehlungen holen'}
      </button>
      {(result.exercises || result.posture || result.tips) && (
        <div className="mt-3 text-sm">
          {result.exercises && <p><strong>Übungen:</strong> {result.exercises}</p>}
          {result.posture && <p><strong>Haltung:</strong> {result.posture}</p>}
          {result.tips && <p><strong>Tipps:</strong> {result.tips}</p>}
        </div>
      )}
    </div>
  )
}
