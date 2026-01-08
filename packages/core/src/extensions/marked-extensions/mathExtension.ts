/**
 * 数学公式扩展
 *
 * 提供块级和行内数学公式的支持
 *
 * 块级公式（display math）：
 * - $$...$$ 格式（Markdown 标准，默认支持）
 * - \[...\] 格式（TeX 风格，需要配置开启）
 *
 * 行内公式（inline math）：
 * - $...$ 格式（Markdown 标准，默认支持）
 * - \(...\) 格式（TeX 风格，需要配置开启）
 *
 * 这两种格式都是 MathJax/KaTeX 支持的标准分隔符
 */

import type { TokenizerExtension } from 'marked'
import type { BlockMathToken, InlineMathToken } from './types'

/**
 * 数学公式扩展配置选项
 */
export interface MathExtensionOptions {
  /**
   * 启用 TeX 风格的公式分隔符 (default: `false`)
   *
   * 开启后同时支持：
   * - 行内公式：\(...\)
   * - 块级公式：\[...\]
   *
   * 这是 LaTeX/TeX 原生语法，MathJax 和 KaTeX 都支持。
   */
  tex?: boolean
}

/**
 * 解析后的配置（所有选项都有默认值）
 */
interface ResolvedMathExtensionOptions {
  tex: boolean
}

/**
 * 解析配置，填充默认值
 */
function resolveOptions(options?: MathExtensionOptions): ResolvedMathExtensionOptions {
  return {
    tex: options?.tex ?? false,
  }
}

/**
 * 创建块级数学公式扩展
 *
 * 支持两种格式：
 * - $$...$$ 格式（Markdown 标准，默认支持）
 * - \[...\] 格式（TeX 风格，需要配置开启）
 *
 * @param options - 配置选项
 * @returns marked 扩展对象
 */
export function createBlockMathExtension(options?: MathExtensionOptions): TokenizerExtension {
  const resolved = resolveOptions(options)

  return {
    name: 'blockMath',
    level: 'block',
    start(src: string): number | undefined {
      // 匹配行首的 $$ (允许前面有空格)
      const dollarMatch = src.match(/^ {0,3}\$\$/m)

      // 如果开启了 TeX 风格，也匹配 \[
      let bracketMatch: RegExpMatchArray | null = null
      if (resolved.tex) {
        bracketMatch = src.match(/^ {0,3}\\\[/m)
      }

      // 返回最先出现的位置
      if (dollarMatch && bracketMatch) {
        return Math.min(dollarMatch.index!, bracketMatch.index!)
      }
      return dollarMatch?.index ?? bracketMatch?.index
    },
    tokenizer(src: string): BlockMathToken | undefined {
      // 匹配 $$...$$ 块级公式（支持多行，允许行首空格）
      const dollarRule = /^ {0,3}\$\$([\s\S]*?)\$\$ *(?:\n+|$)/
      const dollarMatch = dollarRule.exec(src)
      if (dollarMatch) {
        return {
          type: 'blockMath',
          raw: dollarMatch[0],
          text: dollarMatch[1].trim(),
        }
      }

      // 如果开启了 TeX 风格，匹配 \[...\] 块级公式
      if (resolved.tex) {
        const bracketRule = /^ {0,3}\\\[([\s\S]*?)\\\] *(?:\n+|$)/
        const bracketMatch = bracketRule.exec(src)
        if (bracketMatch) {
          return {
            type: 'blockMath',
            raw: bracketMatch[0],
            text: bracketMatch[1].trim(),
          }
        }
      }

      return undefined
    },
    renderer(): string {
      return ''
    },
  } as TokenizerExtension
}

/**
 * 创建行内数学公式扩展
 *
 * 支持两种格式：
 * - $...$ 格式（Markdown 标准，默认支持）
 * - \(...\) 格式（TeX 风格，需要配置开启）
 *
 * @param options - 配置选项
 * @returns marked 扩展对象
 */
export function createInlineMathExtension(options?: MathExtensionOptions): TokenizerExtension {
  const resolved = resolveOptions(options)

  return {
    name: 'inlineMath',
    level: 'inline',
    start(src: string): number | undefined {
      // 查找 $ 分隔符
      const dollarIndex = src.indexOf('$')

      // 排除 $$ 开头（那是块级公式）
      const validDollarIndex =
        dollarIndex !== -1 && src[dollarIndex + 1] !== '$' ? dollarIndex : -1

      // 如果开启了 TeX 风格，也查找 \( 分隔符
      let parenIndex = -1
      if (resolved.tex) {
        parenIndex = src.indexOf('\\(')
      }

      // 返回最先出现的位置
      if (validDollarIndex !== -1 && parenIndex !== -1) {
        return Math.min(validDollarIndex, parenIndex)
      }
      if (validDollarIndex !== -1) return validDollarIndex
      if (parenIndex !== -1) return parenIndex
      return undefined
    },
    tokenizer(src: string): InlineMathToken | undefined {
      // 匹配 $...$ 行内公式（不匹配 $$）
      // 使用非贪婪匹配，支持转义的 \$
      const dollarRule = /^\$(?!\$)((?:\\.|[^\\\n$])+?)\$(?!\d)/
      const dollarMatch = dollarRule.exec(src)
      if (dollarMatch) {
        return {
          type: 'inlineMath',
          raw: dollarMatch[0],
          text: dollarMatch[1].trim(),
        }
      }

      // 如果开启了 TeX 风格，匹配 \(...\) 行内公式
      if (resolved.tex) {
        const parenRule = /^\\\(([\s\S]*?)\\\)/
        const parenMatch = parenRule.exec(src)
        if (parenMatch) {
          return {
            type: 'inlineMath',
            raw: parenMatch[0],
            text: parenMatch[1].trim(),
          }
        }
      }

      return undefined
    },
    renderer(): string {
      return ''
    },
  } as TokenizerExtension
}
