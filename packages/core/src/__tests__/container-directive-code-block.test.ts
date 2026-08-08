/**
 * 容器指令（:::）与代码块交互的边界检测测试
 *
 * 测试目标：
 * preprocessTokens 里的容器指令扫描器会把已经 lexer 分好词的 token 的 raw
 * 文本重新拼接、按行扫描 ::: 标记，但没有跳过来自 code/html token 的行——
 * 于是围栏代码块内部字面出现的 ::: 会被误判成容器指令的收尾，导致：
 * 1. 代码块内容被截断（}:::` 之后的内容被当成容器收尾，代码块提前"结束"）
 * 2. 代码块之后的真实内容被拆散成独立的段落/伪代码块，与 marked 自身的
 *    词法分析结果永久性分歧
 */

import { describe, it, expect } from 'vitest'
import { marked } from 'marked'
import { createIncremarkParser } from '../parser'
import { MarkedAstBuilder } from '../parser/ast/MarkedAstBuildter'
import { normalizeAst } from './helpers/test-utils'

describe('容器指令 - 代码块内的 ::: 不应被当成容器边界', () => {
  it('围栏代码块内的 ::: 是字面内容，不是容器收尾', () => {
    const markdown = [
      ':::info',
      'before',
      '```',
      ':::',
      'literal fence content, not a real close',
      '```',
      'after',
      ':::',
      ''
    ].join('\n')

    // marked 自身对这段文本的理解：一个 paragraph，一个跨 4 行的 code token
    // （其中 ::: 只是代码块内容的一部分），再一个 paragraph
    const markedTokens = marked.lexer(markdown)
    expect(markedTokens.map((t) => t.type)).toEqual(['paragraph', 'code', 'paragraph'])
    expect((markedTokens[1] as { raw: string }).raw).toBe(
      '```\n:::\nliteral fence content, not a real close\n```\n'
    )

    const builder = new MarkedAstBuilder({ containers: true })
    const root = builder.parse(markdown)

    // 容器指令的收尾必须是最后一行顶格的 :::，不是围栏代码块内部的那一行
    expect(root.children).toHaveLength(1)
    expect(root.children[0].type).toBe('containerDirective')

    const container = root.children[0] as unknown as {
      children: Array<{ type: string; value?: string }>
    }
    // 容器内部应该是：段落 "before" + 完整的代码块（含内部 :::) + 段落 "after"
    expect(container.children.map((c) => c.type)).toEqual(['paragraph', 'code', 'paragraph'])
    const codeChild = container.children[1] as { type: string; value: string }
    expect(codeChild.value).toBe(':::\nliteral fence content, not a real close')
  })

  it('逐字符增量解析与一次性解析结果一致（不因 ::: 扫描器产生分歧）', () => {
    const markdown = [
      ':::warning',
      '```js',
      'const x = 1',
      ':::',
      '```',
      ':::',
      ''
    ].join('\n')

    const onePassParser = createIncremarkParser({ containers: true })
    onePassParser.append(markdown)
    const onePass = normalizeAst(onePassParser.getAst())

    const incrementalParser = createIncremarkParser({ containers: true })
    for (const ch of markdown) {
      incrementalParser.append(ch)
    }
    const incremental = normalizeAst(incrementalParser.getAst())

    expect(incremental).toEqual(onePass)
  })

  it('HTML 块内的 ::: 同样不应被当成容器边界', () => {
    const markdown = [':::note', '<div>', ':::', '</div>', '', 'after', '', ':::', ''].join('\n')

    const markedTokens = marked.lexer(markdown)
    // marked 把 <div>...:::...</div> 识别为一个连续的 html block token
    const htmlToken = markedTokens.find((t) => t.type === 'html')
    expect(htmlToken).toBeDefined()
    expect((htmlToken as { raw: string }).raw).toBe('<div>\n:::\n</div>\n\n')

    const builder = new MarkedAstBuilder({ containers: true, htmlTree: false })
    const root = builder.parse(markdown)

    expect(root.children).toHaveLength(1)
    expect(root.children[0].type).toBe('containerDirective')
  })

  it('普通（不含 :::) 的容器指令仍然正常工作（回归保护）', () => {
    const markdown = [':::info', 'plain content', ':::', ''].join('\n')

    const builder = new MarkedAstBuilder({ containers: true })
    const root = builder.parse(markdown)

    expect(root.children).toHaveLength(1)
    expect(root.children[0].type).toBe('containerDirective')
    const container = root.children[0] as unknown as {
      children: Array<{ type: string }>
    }
    expect(container.children).toHaveLength(1)
    expect(container.children[0].type).toBe('paragraph')
  })
})
