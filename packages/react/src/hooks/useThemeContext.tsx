import { useContext, computed, createContext, type Context } from 'react'
import type { DesignTokens } from '@incremark/theme'

type ThemeValue = 'default' | 'dark' | DesignTokens | Partial<DesignTokens>

const ThemeContext: Context<ThemeValue> = createContext('default')

export function provideTheme(theme: ThemeValue) {
  return { ThemeContext, theme }
}

export function useThemeContext() {
  const theme = useContext(ThemeContext)

  // 判断是否为暗色主题
  const isDark = computed(() => {
    const themeValue = theme
    if (typeof themeValue === 'string') {
      return themeValue === 'dark'
    }
    // 如果是 DesignTokens 对象，通过判断颜色来决定
    return false
  })

  return {
    theme,
    isDark: isDark.value
  }
}

// 为了兼容，添加一个简单的 computed 实现
function computed<T>(fn: () => T): { value: T } {
  return { value: fn() }
}
