import { useContext, createContext, type Context } from 'solid-js'
import { createStore, produce } from 'solid-js/store'
import type { DesignTokens } from '@incremark/theme'

type ThemeValue = 'default' | 'dark' | DesignTokens | Partial<DesignTokens>

const ThemeContext: Context<ThemeValue> = createContext('default')

export function provideTheme(theme: ThemeValue) {
  return { ThemeContext, theme }
}

export function useThemeContext() {
  const theme = useContext(ThemeContext)

  // 判断是否为暗色主题
  const isDark = () => {
    const themeValue = theme
    if (typeof themeValue === 'string') {
      return themeValue === 'dark'
    }
    // 如果是 DesignTokens 对象，通过判断颜色来决定
    return false
  }

  return {
    theme,
    isDark: isDark()
  }
}
