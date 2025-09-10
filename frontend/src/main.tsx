import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './routes/App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

async function ensureNotifications() {
  if ('Notification' in window && Notification.permission === 'default') {
    try { await Notification.requestPermission() } catch {}
  }
}
ensureNotifications()
