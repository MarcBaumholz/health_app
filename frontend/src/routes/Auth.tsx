import { useState } from 'react'
import { Card, CardContent, CardHeader, Button, Input } from '@components/ui'
import { setToken, setEmail } from '@state/auth'

async function api(path: string, data: any) {
  const resp = await fetch(`http://localhost:3001/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data), credentials: 'omit' })
  if (!resp.ok) throw new Error(await resp.text())
  return resp.json()
}

export function AuthPage({ onAuth }: { onAuth: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login'|'signup'|'verify'>('login')
  const [err, setErr] = useState('')
  const [code, setCode] = useState('')

  async function submit() {
    try {
      setErr('')
      if (mode === 'signup') {
        const res = await api('signup', { email, password })
        setMode('verify')
        setEmail(email)
        setErr('Bestätigungscode (dev): ' + (res.code || 'gesendet'))
        return
      }
      if (mode === 'verify') {
        const res = await api('verify', { email, code })
        setToken(res.token)
        setEmail(email)
        onAuth(); return
      }
      const res = await api('login', { email, password })
      setToken(res.token)
      setEmail(email)
      onAuth()
    } catch (e: any) {
      setErr('Fehler: ' + (e?.message || ''))
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader className="font-semibold">{mode === 'login' ? 'Anmelden' : mode === 'signup' ? 'Registrieren' : 'E-Mail verifizieren'}</CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="E-Mail" value={email} onChange={(e: any) => setEmail(e.target.value)} />
          {mode !== 'verify' && <Input placeholder="Passwort" type="password" value={password} onChange={(e: any) => setPassword(e.target.value)} />}
          {mode === 'verify' && <Input placeholder="Bestätigungscode" value={code} onChange={(e: any) => setCode(e.target.value)} />}
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <div className="flex gap-2">
            <Button onClick={submit}>{mode === 'login' ? 'Login' : mode === 'signup' ? 'Signup' : 'Verifizieren'}</Button>
            <Button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Ich habe noch kein Konto' : 'Ich habe schon ein Konto'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
