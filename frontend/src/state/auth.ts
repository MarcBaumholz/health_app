export function setToken(token: string) {
  localStorage.setItem('gw_token', token)
}
export function getToken(): string | null {
  return localStorage.getItem('gw_token')
}
export function setEmail(email: string) {
  localStorage.setItem('gw_email', email)
}
export function getEmail(): string | null {
  return localStorage.getItem('gw_email')
}
export function clearAuth() {
  localStorage.removeItem('gw_token')
  localStorage.removeItem('gw_email')
}
