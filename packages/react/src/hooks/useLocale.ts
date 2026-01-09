import { useContext, useMemo } from 'react'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'
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

/**
 * 使用 locale
 */
export function useLocale(): UseLocaleReturn {
  const context = useContext(LocaleContext)

  // 使用 useContext 的默认值，如果没有 provider 则使用中文
  const { locale } = context || { locale: zhCN }

  const t = useMemo(
    () => (key: string) => {
      const keys = key.split('.')
      let value: any = locale
      for (const k of keys) {
        value = value?.[k]
      }
      return value || key
    },
    [locale]
  )

  return { t }
}
