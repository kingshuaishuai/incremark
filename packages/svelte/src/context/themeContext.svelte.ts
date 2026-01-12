/**
 * @file Theme Context - Svelte Context 实现
 * @description 管理主题的共享状态，使用 Svelte 5 runes 语法
 */

import { setContext, getContext } from 'svelte'
import type { DesignTokens } from '@incremark/theme'

/**
 * 主题值类型
 */
export type ThemeValue = 'default' | 'dark' | DesignTokens | Partial<DesignTokens>

/**
 * Context key
 */
const THEME_CONTEXT_KEY = Symbol('themeContext')

/**
 * 设置 Theme Context
 *
 * @description
 * 在父组件中调用，为子组件提供 theme context
 *
 * @example
 * ```svelte
 * <script>
 *   import { setThemeContext } from '@incremark/svelte'
 *
 *   let { theme = 'default' } = $props()
 *   setThemeContext(theme)
 * </script>
 * ```
 */
export function setThemeContext(theme: ThemeValue): void {
  setContext(THEME_CONTEXT_KEY, theme)
}

/**
 * 获取 Theme Context
 *
 * @description
 * 在子组件中调用，获取父组件提供的 theme context
 *
 * @returns 主题值
 *
 * @example
 * ```svelte
 * <script>
 *   import { getThemeContext } from '@incremark/svelte'
 *
 *   const theme = getThemeContext()
 *   const isDark = $derived(typeof theme === 'string' ? theme === 'dark' : false)
 * </script>
 * ```
 */
export function getThemeContext(): ThemeValue {
  const context = getContext<ThemeValue>(THEME_CONTEXT_KEY)

  if (!context) {
    return 'default' // 返回默认值而不是抛出错误
  }

  return context
}

/**
 * 使用 Theme Context Hook
 *
 * @description
 * 便捷 hook，返回 theme 和 isDark 计算属性
 *
 * @returns 包含 theme 和 isDark 的对象
 *
 * @example
 * ```svelte
 * <script>
 *   import { useThemeContext } from '@incremark/svelte'
 *
 *   const { theme, isDark } = useThemeContext()
 * </script>
 *
 * <div class:dark={isDark}>
 *   ...
 * </div>
 * ```
 */
export function useThemeContext() {
  return {
    get theme(): ThemeValue {
      return getThemeContext()
    },
    get isDark(): boolean {
      const currentTheme = getThemeContext()
      return typeof currentTheme === 'string' ? currentTheme === 'dark' : false
    }
  }
}
