/**
 * 内联 HTML 扩展
 *
 * 解析内联 HTML 标签（如 <span>text</span>）
 * 用于与 Micromark 保持一致的 HTML 处理行为
 */

import type { TokenizerExtension } from 'marked'
import type { InlineHtmlToken } from './types'

/**
 * HTML 标签正则表达式
 *
 * 匹配：
 * - 开标签: <tag> 或 <tag attr="value">
 * - 闭标签: </tag>
 * - 自闭合: <tag /> 或 <br>
 */
const SELF_CLOSING_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
])

/**
 * 创建内联 HTML 扩展
 *
 * @returns marked 扩展对象
 */
export function createInlineHtmlExtension(): TokenizerExtension {
  return {
    name: 'inlineHtml',
    level: 'inline',
    start(src: string): number | undefined {
      // 查找 < 字符，但排除转义和特殊情况
      const index = src.indexOf('<')
      if (index === -1) return undefined

      // 检查是否是有效的 HTML 标签开始
      const afterLt = src.slice(index + 1)
      // 必须是字母开头（开标签）或 / 后跟字母（闭标签）
      if (!/^[a-zA-Z\/]/.test(afterLt)) return undefined

      return index
    },
    tokenizer(src: string): InlineHtmlToken | undefined {
      // 尝试匹配完整的 HTML 元素（开标签 + 内容 + 闭标签）
      const completeTagMatch = matchCompleteHtmlElement(src)
      if (completeTagMatch) {
        return {
          type: 'inlineHtml',
          raw: completeTagMatch,
          text: completeTagMatch
        }
      }

      // 尝试匹配自闭合标签
      const selfClosingMatch = matchSelfClosingTag(src)
      if (selfClosingMatch) {
        return {
          type: 'inlineHtml',
          raw: selfClosingMatch,
          text: selfClosingMatch
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
 * 匹配完整的 HTML 元素（开标签 + 内容 + 闭标签）
 *
 * 支持嵌套，但限制深度以避免性能问题
 */
function matchCompleteHtmlElement(src: string): string | null {
  // 匹配开标签
  const openTagMatch = /^<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:][a-zA-Z0-9_.:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*>/.exec(src)
  if (!openTagMatch) return null

  const tagName = openTagMatch[1].toLowerCase()
  const openTag = openTagMatch[0]

  // 如果是自闭合标签，不需要找闭标签
  if (SELF_CLOSING_TAGS.has(tagName)) {
    return openTag
  }

  // 查找对应的闭标签
  const afterOpenTag = src.slice(openTag.length)

  // 简单的嵌套计数
  let depth = 1
  let pos = 0
  const openPattern = new RegExp(`<${tagName}(?:\\s[^>]*)?>`, 'gi')
  const closePattern = new RegExp(`</${tagName}>`, 'gi')

  while (depth > 0 && pos < afterOpenTag.length) {
    // 重置 lastIndex
    openPattern.lastIndex = pos
    closePattern.lastIndex = pos

    const nextOpen = openPattern.exec(afterOpenTag)
    const nextClose = closePattern.exec(afterOpenTag)

    if (!nextClose) {
      // 没有找到闭标签，说明 HTML 不完整
      return null
    }

    if (nextOpen && nextOpen.index < nextClose.index) {
      // 先遇到开标签，深度 +1
      depth++
      pos = nextOpen.index + nextOpen[0].length
    } else {
      // 先遇到闭标签，深度 -1
      depth--
      pos = nextClose.index + nextClose[0].length
    }
  }

  if (depth === 0) {
    return src.slice(0, openTag.length + pos)
  }

  return null
}

/**
 * 匹配自闭合标签
 */
function matchSelfClosingTag(src: string): string | null {
  // 匹配 <tag /> 格式
  const explicitSelfClosing = /^<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:][a-zA-Z0-9_.:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/>/.exec(src)
  if (explicitSelfClosing) {
    return explicitSelfClosing[0]
  }

  // 匹配隐式自闭合标签（如 <br>、<img src="...">）
  const implicitSelfClosing = /^<([a-zA-Z][a-zA-Z0-9]*)((?:\s+[a-zA-Z_:][a-zA-Z0-9_.:-]*(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*>/.exec(src)
  if (implicitSelfClosing && SELF_CLOSING_TAGS.has(implicitSelfClosing[1].toLowerCase())) {
    return implicitSelfClosing[0]
  }

  return null
}

