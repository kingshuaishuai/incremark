import { createSignal, type Accessor } from 'solid-js'
import { messages, sampleMarkdowns, type Locale, type Messages } from '../locales'

// Re-export Messages type for use in components
export type { Messages }

const getInitialLocale = (): Locale => {
  if (typeof localStorage === 'undefined') return 'zh'
  return (localStorage.getItem('locale') as Locale) || 'zh'
}

const [locale, setLocaleSignal] = createSignal<Locale>(getInitialLocale())

export function useLocale() {
  const t = () => messages[locale()]
  const sampleMarkdown = () => sampleMarkdowns[locale()]

  function toggleLocale() {
    const newLocale = locale() === 'zh' ? 'en' : 'zh'
    setLocale(newLocale)
  }

  function setLocale(newLocale: Locale) {
    setLocaleSignal(newLocale)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('locale', newLocale)
    }
  }

  return {
    locale,
    setLocale,
    t,
    sampleMarkdown,
    toggleLocale
  }
}
