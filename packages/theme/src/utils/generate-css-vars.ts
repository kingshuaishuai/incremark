/**
 * 从 Token 生成 CSS Variables
 */

import type { DesignTokens } from '../tokens'

export interface GenerateCSSVarsOptions {
  /** CSS Variables 前缀，默认 'incremark' */
  prefix?: string
  /** CSS 选择器，默认 ':root' */
  selector?: string
}

/**
 * 递归将对象转换为 CSS Variables
 */
function objectToCSSVars(
  obj: Record<string, any>,
  prefix: string,
  result: string[] = []
): void {
  for (const [key, value] of Object.entries(obj)) {
    const varName = prefix ? `${prefix}-${key}` : key
    const kebabKey = varName.replace(/([A-Z])/g, '-$1').toLowerCase()

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // 递归处理嵌套对象
      objectToCSSVars(value, kebabKey, result)
    } else {
      // 叶子节点，生成 CSS Variable
      result.push(`  --${kebabKey}: ${value};`)
    }
  }
}

/**
 * 从 DesignTokens 生成 CSS Variables 字符串
 * 
 * @example
 * ```typescript
 * const cssVars = generateCSSVars(defaultTheme, {
 *   prefix: 'incremark',
 *   selector: ':root'
 * })
 * // 输出:
 * // :root {
 * //   --incremark-color-text-primary: #1f2328;
 * //   ...
 * // }
 * ```
 */
export function generateCSSVars(
  tokens: DesignTokens,
  options: GenerateCSSVarsOptions = {}
): string {
  const { prefix = 'incremark', selector = ':root' } = options

  const vars: string[] = []
  objectToCSSVars(tokens, prefix, vars)

  if (vars.length === 0) {
    return selector ? `${selector} {}` : ''
  }

  // 如果选择器为空，只返回变量声明（用于 applyTheme）
  if (!selector) {
    return vars.join('\n')
  }

  return `${selector} {\n${vars.join('\n')}\n}`
}

