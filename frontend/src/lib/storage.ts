const STORAGE_KEY = 'gesundwerk_v1'

export function loadState<T>(): T | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return undefined
    return JSON.parse(raw) as T
  } catch (e) {
    console.warn('Failed to load state', e)
    return undefined
  }
}

export function saveState<T>(state: T) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    console.warn('Failed to save state', e)
  }
}

export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 400) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}
