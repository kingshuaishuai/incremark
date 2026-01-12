/* @jsxImportSource solid-js */

import { type Component, type JSX, createContext, useContext, createMemo, createSignal, type Accessor } from 'solid-js'
import type { DesignTokens } from '@incremark/theme'
import { applyTheme } from '@incremark/theme'

export type Theme = 'default' | 'dark' | Partial<DesignTokens>

export const ThemeContext = createContext<{
  theme: Accessor<Theme>
  setTheme: (theme: Theme) => void
}>()

export interface ThemeProviderProps {
  theme?: Theme
  children?: JSX.Element
}

export const ThemeProvider: Component<ThemeProviderProps> = (props) => {
  let containerRef: HTMLDivElement | undefined
  const [theme, setTheme] = createSignal<Theme>(props.theme || 'default')

  // 应用主题到 DOM - 监听 props.theme 变化
  createMemo(() => {
    const currentTheme = props.theme || 'default'
    setTheme(currentTheme)
    if (typeof document !== 'undefined' && containerRef) {
      applyTheme(containerRef, currentTheme)
    }
  })

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <div ref={containerRef} class="incremark-theme-provider">
        {props.children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// 兼容其他框架的 useThemeContext API
export function useThemeContext() {
  const context = useTheme()

  // 判断是否为暗色主题
  const isDark = () => {
    const themeValue = context.theme()
    if (typeof themeValue === 'string') {
      return themeValue === 'dark'
    }
    // 如果是 DesignTokens 对象，通过判断颜色来决定
    return false
  }

  return {
    theme: context.theme,
    isDark: isDark()
  }
}
