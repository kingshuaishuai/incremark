import { createContext, useMemo, type ReactNode } from 'react'
import type { IncremarkLocale } from '@incremark/shared'
import { en } from '../index'

interface LocaleContextType {
  locale: IncremarkLocale
}

export const LocaleContext = createContext<LocaleContextType | null>(null)

interface ConfigProviderProps {
  children: ReactNode
  locale?: IncremarkLocale
}

export function ConfigProvider({ children, locale = en }: ConfigProviderProps) {
  const contextValue = useMemo(() => ({ locale }), [locale])

  return <LocaleContext.Provider value={contextValue}>{children}</LocaleContext.Provider>
}
