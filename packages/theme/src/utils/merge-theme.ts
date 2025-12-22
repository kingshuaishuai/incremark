/**
 * 深度合并主题，支持部分替换
 */

import type { DesignTokens } from '../tokens'

/**
 * 深度合并两个对象
 */
function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target }

  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      // 递归合并嵌套对象
      result[key] = deepMerge(
        target[key] || ({} as any),
        source[key] as any
      )
    } else if (source[key] !== undefined) {
      // 直接覆盖
      result[key] = source[key] as any
    }
  }

  return result
}

/**
 * 合并主题，支持部分替换
 * 
 * @example
 * ```typescript
 * const customTheme = mergeTheme(defaultTheme, {
 *   color: {
 *     text: {
 *       primary: '#custom-color'
 *     }
 *   }
 * })
 * // 只替换 text.primary，其他保持默认值
 * ```
 */
export function mergeTheme(
  base: DesignTokens,
  override: Partial<DesignTokens>
): DesignTokens {
  return deepMerge(base, override)
}

