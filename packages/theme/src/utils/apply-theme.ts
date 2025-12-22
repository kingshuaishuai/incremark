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
 * // 使用预设主题
 * applyTheme(document.documentElement, 'dark')
 * 
 * // 使用完整主题
 * applyTheme(element, darkTheme)
 * 
 * // 部分替换
 * applyTheme(element, {
 *   color: {
 *     text: {
 *       primary: '#custom-color'
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

  let finalTheme: DesignTokens

  if (typeof theme === 'string') {
    // 字符串主题名
    if (theme === 'dark') {
      finalTheme = darkTheme
    } else {
      finalTheme = defaultTheme
    }
  } else {
    // 主题对象
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
  }

  // 生成 CSS Variables（不包含选择器）
  const cssVars = generateCSSVars(finalTheme, {
    prefix: 'incremark',
    selector: '' // 空选择器，只生成变量声明
  })

  // 解析并应用到元素
  // 移除选择器行（如果有），只保留变量声明
  const varLines = cssVars
    .split('\n')
    .filter(line => {
      const trimmed = line.trim()
      return trimmed && trimmed.startsWith('--') && trimmed.includes(':')
    })
    .map(line => line.trim())

  varLines.forEach(line => {
    const match = line.match(/^--([^:]+):\s*(.+);?$/)
    if (match) {
      const [, varName, value] = match
      target.style.setProperty(`--${varName}`, value.trim())
    }
  })
}

