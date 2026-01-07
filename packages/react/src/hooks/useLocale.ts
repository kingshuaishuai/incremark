import { useContext } from 'react'
import type { IncremarkLocale } from '@incremark/shared'
import { en } from '../index'
import { LocaleContext } from '../components/ConfigProvider'

interface LocaleContextType {
  locale: IncremarkLocale
}

/**
 * React 国际化 Hook
 */
export interface UseLocaleReturn {
  /** 翻译函数 */
  t: (key: string) => string
}

export function useLocale(): UseLocaleReturn {
  const context = useContext(LocaleContext)

  if (!context) {
    // 如果没有提供 locale，使用默认的英文
    const t = (key: string) => {
      const keys = key.split('.')
      let value: any = en
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    }
    return { t }
  }

  const { locale } = context

  const t = (key: string) => {
    const keys = key.split('.')
    let value: any = locale
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  return { t }
}
