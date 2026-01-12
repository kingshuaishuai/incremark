import { useContext, createContext } from 'react'
import type { DesignTokens } from '@incremark/theme'

type ThemeValue = 'default' | 'dark' | DesignTokens | Partial<DesignTokens>

export const ThemeContext = createContext<ThemeValue>('default')

export function useThemeContext() {
  const theme = useContext(ThemeContext)

  // 判断是否为暗色主题
  const isDark = typeof theme === 'string' ? theme === 'dark' : false

  return {
    theme,
    isDark
  }
}
