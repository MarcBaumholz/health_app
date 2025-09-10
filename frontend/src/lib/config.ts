// API Configuration
const isDevelopment = import.meta.env.DEV
const isProduction = import.meta.env.PROD

// Backend URL configuration
export const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3001'  // Local development
  : 'https://your-railway-app.railway.app'  // Production - UPDATE THIS WITH YOUR RAILWAY URL

// Helper function for API calls
export async function apiCall(path: string, data: any, token?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data),
    credentials: 'omit'
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}

// Helper function for GET requests
export async function apiGet(path: string, token?: string) {
  const headers: Record<string, string> = {}
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/${path}`, {
    method: 'GET',
    headers,
    credentials: 'omit'
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }

  return response.json()
}
