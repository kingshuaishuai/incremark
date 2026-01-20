/**
 * 乐观引用解析扩展
 *
 * 作用：强制将引用式链接/图片解析为 linkReference/imageReference 节点，
 * 与 micromark 的输出保持一致。
 *
 * 注意：需要排除脚注引用 [^id]，让脚注处理逻辑来处理
 */

import type { TokenizerExtension } from 'marked'
import type { OptimisticRefToken } from './types'

/**
 * 创建乐观引用扩展
 *
 * @returns marked 扩展对象
 */
export function createOptimisticReferenceExtension(): TokenizerExtension {
  return {
    name: 'optimisticReference',
    level: 'inline',
    start(src: string): number | undefined {
      return src.match(/!?\[/)?.index
    },
    tokenizer(this: any, src: string): OptimisticRefToken | undefined {
      // 匹配 ![...][...] 或 [...][...]
      const rule =
        /^(!?)\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\](?:\s*\[((?:\[[^\]]*\]|[^\[\]]|\](?=[^\[]*\]))*)\])?/
      const match = rule.exec(src)

      if (match) {
        const fullMatch = match[0]

        // 1. 如果是标准链接 [text](url)，跳过
        if (src.length > fullMatch.length && src[fullMatch.length] === '(') {
          return undefined
        }

        // 2. ⚡️ 防抢断：如果后面紧跟 ':'，说明这是 Definition 的一部分，坚决不碰
        if (src.length > fullMatch.length && src[fullMatch.length] === ':') {
          return undefined
        }

        const isImage = match[1] === '!'
        const text = match[2]
        const refRaw = match[3]

        // 3. ⚡️ 排除脚注引用：如果文本以 ^ 开头，这是脚注引用 [^id]，交给脚注处理逻辑
        if (text.startsWith('^')) {
          return undefined
        }

        let identifier = ''
        let referenceType: 'shortcut' | 'collapsed' | 'full' = 'shortcut'

        if (refRaw !== undefined) {
          if (refRaw === '') {
            referenceType = 'collapsed'
            identifier = text
          } else {
            referenceType = 'full'
            identifier = refRaw
          }
        } else {
          referenceType = 'shortcut'
          identifier = text
          // 排除 Checkbox
          if (text.match(/^[ xX]$/)) {
            return undefined
          }
        }

        return {
          type: 'optimisticReference',
          raw: fullMatch,
          isImage,
          text,
          identifier: identifier.toLowerCase(),
          label: identifier,
          referenceType
        }
      }
      return undefined
    },
    renderer(): string {
      return ''
    }
  } as TokenizerExtension
}

