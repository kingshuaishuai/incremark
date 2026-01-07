/**
 * 显式 Definition 扩展
 *
 * 作用：捕获 [id]: ... 整行，手动解析，并立即注册到 marked 的 links 表中。
 * 这能让 marked 原生逻辑正确识别后续的引用图片。
 *
 * 注意：start 函数必须严格匹配 definition 格式 [id]:，否则会干扰 ![alt][id] 的解析
 */

import type { TokenizerExtension } from 'marked'
import type { ExplicitDefinitionToken } from './types'

/**
 * 创建显式定义扩展
 *
 * @returns marked 扩展对象
 */
export function createExplicitDefinitionExtension(): TokenizerExtension {
  return {
    name: 'explicitDefinition',
    level: 'block',
    // 🔑 关键修复：start 必须匹配完整的 definition 模式 [id]:，
    // 而不能只匹配 [，否则会把 ![alt][id] 中的 [alt] 误认为是 definition 开头
    // 同时排除脚注定义 [^id]:
    start(src: string): number | undefined {
      // 匹配 [id]: 但不匹配 [^id]:（脚注定义）
      const match = src.match(/^ {0,3}\[(?!\^)[^\]]+\]:/m)
      return match?.index
    },
    tokenizer(this: any, src: string): ExplicitDefinitionToken | undefined {
      // 匹配整行：[id]: ... 直到换行，但排除脚注定义 [^id]:
      const rule = /^ {0,3}\[(?!\^)[^\]]+\]:.*?(?:\n+|$)/
      const match = rule.exec(src)

      if (match) {
        const raw = match[0]
        // 手动解析内部结构：提取 identifier, url, title
        // 使用 \S+ 匹配 URL，防止被怪异空格截断
        const contentMatch = raw.match(
          /^ {0,3}\[([^\]]+)\]:\s*(\S+)(?:\s+["'(](.*?)["')])?/
        )

        if (contentMatch) {
          const identifier = contentMatch[1].toLowerCase()
          const url = contentMatch[2]
          const title = contentMatch[3]

          // ⚡️ 关键步骤：立即注册到 marked 上下文
          // 这样 marked 在解析后续的 ![Alt][id] 时就能找到定义，从而生成正确的 Image Token
          if (this.lexer?.tokens?.links) {
            this.lexer.tokens.links[identifier] = { href: url, title }
          }

          return {
            type: 'explicitDefinition',
            raw,
            identifier,
            url,
            title
          }
        }

        // 如果捕获了行但解析失败，依然返回 raw Token，防止它漏到 paragraph 里被 Reference 误伤
        return { type: 'explicitDefinition', raw, identifier: '', url: '' }
      }
      return undefined
    },
    renderer(): string {
      return ''
    }
  } as TokenizerExtension
}

