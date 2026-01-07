/**
 * 数学公式扩展
 *
 * 提供块级和行内数学公式的支持
 * - 块级：$$...$$ 格式
 * - 行内：$...$ 格式
 */

import type { TokenizerExtension } from 'marked'
import type { BlockMathToken, InlineMathToken } from './types'

/**
 * 创建块级数学公式扩展
 *
 * 解析 $$...$$ 格式的块级公式
 *
 * @returns marked 扩展对象
 */
export function createBlockMathExtension(): TokenizerExtension {
  return {
    name: 'blockMath',
    level: 'block',
    start(src: string): number | undefined {
      // 匹配行首的 $$ (允许前面有空格)
      const match = src.match(/^ {0,3}\$\$/m)
      return match?.index
    },
    tokenizer(src: string): BlockMathToken | undefined {
      // 匹配 $$...$$ 块级公式（支持多行，允许行首空格）
      const rule = /^ {0,3}\$\$([\s\S]*?)\$\$ *(?:\n+|$)/
      const match = rule.exec(src)
      if (match) {
        return {
          type: 'blockMath',
          raw: match[0],
          text: match[1].trim()
        }
      }
      return undefined
    },
    renderer(): string {
      return ''
    }
  } as TokenizerExtension
}

/**
 * 创建行内数学公式扩展
 *
 * 解析 $...$ 格式的行内公式
 *
 * @returns marked 扩展对象
 */
export function createInlineMathExtension(): TokenizerExtension {
  return {
    name: 'inlineMath',
    level: 'inline',
    start(src: string): number | undefined {
      const index = src.indexOf('$')
      if (index === -1) return undefined
      // 排除 $$ 开头（那是块级公式）
      if (src[index + 1] === '$') return undefined
      return index
    },
    tokenizer(src: string): InlineMathToken | undefined {
      // 匹配 $...$ 行内公式（不匹配 $$）
      // 使用非贪婪匹配，支持转义的 \$
      const rule = /^\$(?!\$)((?:\\.|[^\\\n$])+?)\$(?!\d)/
      const match = rule.exec(src)
      if (match) {
        return {
          type: 'inlineMath',
          raw: match[0],
          text: match[1].trim()
        }
      }
      return undefined
    },
    renderer(): string {
      return ''
    }
  } as TokenizerExtension
}

