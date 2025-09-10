export async function generateKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt','decrypt'])
}
export async function exportKey(key: CryptoKey): Promise<string> {
  const jwk = await crypto.subtle.exportKey('jwk', key)
  return btoa(JSON.stringify(jwk))
}
export async function importKey(b64: string): Promise<CryptoKey> {
  const jwk = JSON.parse(atob(b64))
  return crypto.subtle.importKey('jwk', jwk, { name: 'AES-GCM' }, true, ['encrypt','decrypt'])
}
export async function encryptString(key: CryptoKey, plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const enc = new TextEncoder().encode(plaintext)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc)
  const out = new Uint8Array(iv.byteLength + ct.byteLength)
  out.set(iv, 0)
  out.set(new Uint8Array(ct), iv.byteLength)
  return btoa(String.fromCharCode(...out))
}
export async function decryptString(key: CryptoKey, b64: string): Promise<string> {
  const bin = Uint8Array.from(atob(b64), c=>c.charCodeAt(0))
  const iv = bin.slice(0,12)
  const ct = bin.slice(12)
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct)
  return new TextDecoder().decode(pt)
}
