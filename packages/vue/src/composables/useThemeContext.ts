import { inject, computed, type ComputedRef, provide, type InjectionKey } from 'vue'
import type { DesignTokens } from '@incremark/theme'

const THEME_KEY: InjectionKey<ComputedRef<'default' | 'dark' | DesignTokens | Partial<DesignTokens>>> = Symbol('incremark-theme')

export function provideTheme(theme: ComputedRef<'default' | 'dark' | DesignTokens | Partial<DesignTokens>>) {
  provide(THEME_KEY, theme)
}

export function useThemeContext() {
  const theme = inject(THEME_KEY, computed(() => 'default'))

  // 判断是否为暗色主题
  const isDark = computed(() => {
    const themeValue = theme.value
    if (typeof themeValue === 'string') {
      return themeValue === 'dark'
    }
    // 如果是 DesignTokens 对象，通过判断颜色来决定
    return false
  })

  return {
    theme,
    isDark
  }
}
