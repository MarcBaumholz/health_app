import { getToken } from './auth'

export async function saveCloudState(state: any) {
  const token = getToken()
  if (!token) return
  await fetch('http://localhost:3001/state', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ data: state }) })
}

export async function loadCloudState() {
  const token = getToken()
  if (!token) return null
  const resp = await fetch('http://localhost:3001/state', { headers: { 'Authorization': `Bearer ${token}` } })
  if (!resp.ok) return null
  const j = await resp.json()
  return j.data
}
