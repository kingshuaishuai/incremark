import { createContext, useMemo, type ReactNode } from 'react'
import type { IncremarkLocale } from '@incremark/shared'
import { zhCN } from '@incremark/shared'

interface LocaleContextType {
  locale: IncremarkLocale
}

export const LocaleContext = createContext<LocaleContextType | null>(null)

interface ConfigProviderProps {
  children: ReactNode
  locale?: IncremarkLocale
}

// 提供 locale 给子组件（确保不是 undefined）
export function ConfigProvider({ children, locale }: ConfigProviderProps) {
  const contextValue = useMemo(() => ({ locale: locale || zhCN }), [locale])

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}
