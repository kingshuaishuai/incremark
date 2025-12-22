/**
 * 应用主题到 DOM 元素
 */

import type { DesignTokens } from '../tokens'
import { generateCSSVars } from './generate-css-vars'
import { mergeTheme } from './merge-theme'
import { defaultTheme } from '../themes/default'
import { darkTheme } from '../themes/dark'

/**
 * 应用主题到 DOM 元素
 *
 * @param element - 目标元素，默认为 document.documentElement
 * @param theme - 主题配置，可以是：
 *   - 字符串：'default' | 'dark'
 *   - 完整主题对象：DesignTokens
 *   - 部分主题对象：Partial<DesignTokens>（会合并到默认主题）
 *
 * @example
 * ```typescript
 * // 使用预设主题（通过类名切换）
 * applyTheme(containerElement, 'dark')  // 添加 .theme-dark 类
 * applyTheme(containerElement, 'default')  // 移除 .theme-dark 类
 *
 * // 使用自定义主题（通过 inline style 设置 CSS 变量）
 * applyTheme(containerElement, {
 *   color: {
 *     brand: {
 *       primary: '#8b5cf6'
 *     }
 *   }
 * })
 * ```
 */
export function applyTheme(
  element: HTMLElement | Document = document,
  theme: 'default' | 'dark' | DesignTokens | Partial<DesignTokens>
): void {
  const target: HTMLElement = element === document ? document.documentElement : (element as HTMLElement)
  console.log('target', target)

  // 处理字符串主题名（使用类名切换）
  if (typeof theme === 'string') {
    if (theme === 'dark') {
      // 添加 dark 主题类名
      target.classList.add('theme-dark')
      target.setAttribute('data-theme', 'dark')
    } else {
      // 移除 dark 主题类名（回到默认主题）
      target.classList.remove('theme-dark')
      target.removeAttribute('data-theme')
    }
    target.style.cssText = "";
    return
  }

  // 处理主题对象（使用 inline style 设置 CSS 变量）
  let finalTheme: DesignTokens

  // 检查是否是完整主题（有所有必需字段）还是部分主题
  const isCompleteTheme =
    theme.color?.text?.primary !== undefined &&
    theme.typography?.fontFamily?.base !== undefined &&
    theme.spacing?.sm !== undefined

  if (isCompleteTheme) {
    finalTheme = theme as DesignTokens
  } else {
    // 部分主题，合并到默认主题
    finalTheme = mergeTheme(defaultTheme, theme)
  }

  // 移除预设主题类名（使用自定义主题时）
  target.classList.remove('theme-dark')
  target.removeAttribute('data-theme')

  // 生成 CSS Variables（不包含选择器）
  const cssVars = generateCSSVars(finalTheme, {
    prefix: 'incremark',
    selector: '' // 空选择器，只生成变量声明
  })

  target.style.cssText = cssVars;
}
