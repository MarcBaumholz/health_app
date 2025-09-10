export type Lang = 'de' | 'en'
export const strings: Record<Lang, Record<string, string>> = {
  de: {
    dashboard: 'Dashboard', assistant: 'Assistent', wissen: 'Wissen', wochenreview: 'Wochenreview', verlauf: 'Verlauf', journal: 'Journal', erfolge: 'Erfolge', einstellungen: 'Einstellungen', profil: 'Profil'
  },
  en: {
    dashboard: 'Dashboard', assistant: 'Assistant', wissen: 'Knowledge', wochenreview: 'Weekly Review', verlauf: 'History', journal: 'Journal', erfolge: 'Achievements', einstellungen: 'Settings', profil: 'Profile'
  }
}
export function getLang(): Lang { return (localStorage.getItem('gw_lang') as Lang) || 'de' }
export function setLang(l: Lang) { localStorage.setItem('gw_lang', l) }
