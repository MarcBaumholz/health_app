import { Card, CardHeader, CardContent, Button } from '@components/ui'
import { getEmail, clearAuth, getToken } from '@state/auth'
import { useAppStore } from '@state/store'
import { exportJournalKey, importJournalKey } from '@state/journal'

export function ProfilePage() {
  const email = getEmail() || 'Unbekannt'
  const resetDefaults = useAppStore((s) => s.resetDefaults)
  const state = useAppStore((s) => s)

  function logout() {
    clearAuth()
    window.location.reload()
  }

  function exportState() {
    const data = JSON.stringify(state, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'gesundwerk-state.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function importState(e: any) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result))
        useAppStore.getState().hydrateFromCloud(json)
      } catch {}
    }
    reader.readAsText(file)
  }

  async function deleteAccount() {
    const token = getToken()
    if (!token) return
    if (!confirm('Account wirklich löschen?')) return
    try {
      const { apiCall } = await import('@lib/config')
      await apiCall('delete_account', {}, token)
    } catch {}
    clearAuth()
    window.location.reload()
  }

  return (
    <div className="max-w-lg">
      <Card>
        <CardHeader className="font-semibold">Profil</CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm"><span className="font-medium">E-Mail:</span> {email}</div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={logout}>Logout</Button>
            <Button className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200" onClick={resetDefaults}>Lokale Daten zurücksetzen</Button>
            <Button onClick={exportState}>Daten exportieren</Button>
            <label className="px-4 py-2 inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 hover:bg-teal-200 text-sm text-teal-900 cursor-pointer">
              Importieren
              <input type="file" accept="application/json" className="hidden" onChange={importState} />
            </label>
            <Button onClick={async ()=>{
              const b64 = await exportJournalKey()
              navigator.clipboard.writeText(b64).catch(()=>{})
              alert('Journal-Schlüssel in Zwischenablage kopiert')
            }}>Journal-Schlüssel kopieren</Button>
            <Button onClick={async ()=>{
              const b64 = prompt('Journal-Schlüssel einfügen')
              if (b64) await importJournalKey(b64)
              alert('Journal-Schlüssel importiert')
            }}>Journal-Schlüssel importieren</Button>
            <Button className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200" onClick={deleteAccount}>Account löschen</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
