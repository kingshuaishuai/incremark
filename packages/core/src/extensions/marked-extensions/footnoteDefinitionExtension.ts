/**
 * 脚注定义扩展
 *
 * 解析 [^id]: content 格式的脚注定义
 * 支持多行脚注（后续行需要 4 空格缩进）
 */

import type { TokenizerExtension } from 'marked'
import type { FootnoteDefinitionBlockToken } from './types'

/**
 * 创建脚注定义扩展
 *
 * @returns marked 扩展对象
 */
export function createFootnoteDefinitionExtension(): TokenizerExtension {
  return {
    name: 'footnoteDefinitionBlock',
    level: 'block',
    start(src: string): number | undefined {
      // 匹配 [^id]: 格式的开头
      const match = src.match(/^ {0,3}\[\^[^\]]+\]:/m)
      return match?.index
    },
    tokenizer(src: string): FootnoteDefinitionBlockToken | undefined {
      // 匹配脚注定义的第一行：[^id]: content
      // 脚注标识符可以包含字母、数字、下划线、连字符
      const firstLineRule = /^ {0,3}\[\^([a-zA-Z0-9_-]+)\]:\s*(.*)/
      const firstLineMatch = firstLineRule.exec(src)

      if (!firstLineMatch) return undefined

      const identifier = firstLineMatch[1]
      let content = firstLineMatch[2]
      let raw = firstLineMatch[0]

      // 计算第一行后剩余的内容
      const remaining = src.slice(raw.length)

      // 处理多行脚注：后续行需要至少 4 空格缩进，或者是空行后的缩进行
      // 使用 lines 数组来简化处理
      const lines = remaining.split('\n')
      let lineIndex = 0

      // 跳过第一个空字符串（如果 remaining 以 \n 开头）
      if (lines[0] === '' && remaining.startsWith('\n')) {
        lineIndex = 1
        raw += '\n'
        content += '\n'
      }

      while (lineIndex < lines.length) {
        const line = lines[lineIndex]

        // 空行：继续检查下一行是否有缩进
        if (line.trim() === '') {
          // 预检查：空行后是否有缩进行？
          let hasIndentedLineAfter = false
          for (let j = lineIndex + 1; j < lines.length; j++) {
            const nextLine = lines[j]
            if (nextLine.trim() === '') continue // 跳过连续空行
            if (nextLine.match(/^(    |\t)/)) {
              hasIndentedLineAfter = true
            }
            break
          }

          if (hasIndentedLineAfter) {
            raw += line + (lineIndex < lines.length - 1 ? '\n' : '')
            content += '\n' + line
            lineIndex++
            continue
          } else {
            // 空行后没有缩进行，结束脚注
            break
          }
        }

        // 检查是否有 4 空格缩进（脚注延续行）
        if (line.match(/^(    |\t)/)) {
          raw += line + (lineIndex < lines.length - 1 ? '\n' : '')
          content += '\n' + line
          lineIndex++
          continue
        }

        // 遇到新的脚注定义，结束当前脚注
        if (line.match(/^ {0,3}\[\^[^\]]+\]:/)) {
          break
        }

        // 遇到非缩进非空行，结束脚注
        break
      }

      // 如果最后有尾随空行，移除它们（不影响 raw，只影响 content）
      const trimmedContent = content.replace(/\n+$/, '')

      return {
        type: 'footnoteDefinitionBlock',
        raw,
        identifier,
        content: trimmedContent
      }
    },
    renderer(): string {
      return ''
    }
  } as TokenizerExtension
}

