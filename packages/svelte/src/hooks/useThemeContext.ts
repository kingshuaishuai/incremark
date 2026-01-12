import { getContext, setContext, writable, type Readable } from 'svelte/store'
import type { DesignTokens } from '@incremark/theme'

type ThemeValue = 'default' | 'dark' | DesignTokens | Partial<DesignTokens>

const THEME_KEY = Symbol('incremark-theme')

export function provideTheme(theme: Readable<ThemeValue>) {
  setContext(THEME_KEY, theme)
  return { THEME_KEY, theme }
}

export function useThemeContext() {
  const theme = getContext<Readable<ThemeValue>>(THEME_KEY) || writable('default')

  // 判断是否为暗色主题
  const isDark = () => {
    const themeValue = get(theme)
    if (typeof themeValue === 'string') {
      return themeValue === 'dark'
    }
    // 如果是 DesignTokens 对象，通过判断颜色来决定
    return false
  }

  return {
    theme,
    isDark
  }
}

// Helper function to get value from a store
function get<T>(store: Readable<T> | T): T {
  return 'subscribe' in store ? (store as Readable<T>).subscribe(() => {})(), store
}
