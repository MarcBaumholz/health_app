import { getToken } from './auth'
import { apiCall, apiGet } from '@lib/config'

export async function saveCloudState(state: any) {
  const token = getToken()
  if (!token) return
  await apiCall('state', { data: state }, token)
}

export async function loadCloudState() {
  const token = getToken()
  if (!token) return null
  try {
    const j = await apiGet('state', token)
    return j.data
  } catch {
    return null
  }
}
