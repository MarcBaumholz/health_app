import { useAppStore } from './store'
import { toDateKey } from '@lib/date'
import { idbSet, idbGet } from '@lib/idb'
import { encryptString, decryptString, generateKey, exportKey, importKey } from '@lib/crypto'

async function getOrCreateKeyB64(): Promise<string> {
  let b64 = await idbGet('meta', 'journal_key')
  if (!b64) {
    const key = await generateKey()
    b64 = await exportKey(key)
    await idbSet('meta', 'journal_key', b64)
  }
  return b64
}

export async function exportJournalKey(): Promise<string> {
  return getOrCreateKeyB64()
}
export async function importJournalKey(b64: string): Promise<void> {
  // validate
  await importKey(b64)
  await idbSet('meta', 'journal_key', b64)
}

export async function appendTodayEntry() {
  const s = useAppStore.getState()
  const day = toDateKey()
  const draft = s.ui.journalDraft?.trim()
  if (!draft) return false
  const arr = s.journalByDate[day] ? [...s.journalByDate[day]!] : []
  arr.push(draft)
  useAppStore.setState({ journalByDate: { ...s.journalByDate, [day]: arr }, ui: { ...s.ui, journalDraft: '' } })
  // persist encrypted
  const key = await importKey(await getOrCreateKeyB64())
  const payload = JSON.stringify(useAppStore.getState().journalByDate)
  const enc = await encryptString(key, payload)
  await idbSet('journal', 'byDate', enc)
  return true
}

export async function hydrateJournalFromIdb() {
  try {
    const b64 = await idbGet('journal', 'byDate')
    if (!b64) return
    const key = await importKey(await getOrCreateKeyB64())
    const plain = await decryptString(key, b64)
    const map = JSON.parse(plain)
    useAppStore.setState((s) => ({ ...s, journalByDate: map }))
  } catch {}
}
