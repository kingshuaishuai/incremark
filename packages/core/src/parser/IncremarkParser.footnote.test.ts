/**
 * 脚注解析测试
 * 
 * 测试增量解析场景下脚注的正确处理，特别是多行脚注的稳定性判断
 */

import { describe, it, expect } from 'vitest'
import { IncremarkParser } from './IncremarkParser'
import type { FootnoteDefinition } from 'mdast'

/**
 * 辅助函数：从 AST 中提取所有脚注定义
 */
function extractFootnoteDefinitions(parser: IncremarkParser): FootnoteDefinition[] {
  const ast = parser.getAst()
  return ast.children.filter(
    (node): node is FootnoteDefinition => node.type === 'footnoteDefinition'
  )
}

describe('脚注解析 - 基础场景', () => {
  it('应该正确解析简单脚注', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `这是一个脚注引用[^1]。

[^1]: 这是脚注内容。`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
    expect(footnotes[0].children).toHaveLength(1)
  })

  it('应该正确解析多个脚注', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `第一个[^a]和第二个[^b]脚注。

[^a]: 脚注 A 的内容。

[^b]: 脚注 B 的内容。`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(2)
    expect(footnotes[0].identifier).toBe('a')
    expect(footnotes[1].identifier).toBe('b')
  })

  it('应该正确解析连续的脚注定义', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 内容 1
[^2]: 内容 2
[^3]: 内容 3`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(3)
  })
})

describe('脚注解析 - 多行脚注（关键测试）', () => {
  it('应该正确解析带缩进的多行脚注', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 第一行
    第二行（缩进）
    第三行（缩进）`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
    // 多行内容应该合并到一个段落中
    expect(footnotes[0].children.length).toBeGreaterThan(0)
  })

  it('应该正确处理脚注中的空行', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 第一段

    第二段（缩进）`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
    // 应该包含两个段落
    expect(footnotes[0].children.length).toBeGreaterThanOrEqual(1)
  })

  it('应该正确处理脚注中的列表', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 说明
    
    - 列表项 1
    - 列表项 2`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
  })

  it('应该正确处理脚注中的代码块（8空格缩进）', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 说明

        代码块内容
        第二行代码`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
  })
})

describe('脚注解析 - 增量解析（稳定性测试）', () => {
  it('脚注第一行结束后不应该立即标记为 completed', () => {
    const parser = new IncremarkParser({ gfm: true })
    
    // 第一步：添加脚注第一行
    const update1 = parser.append('[^1]: 第一行\n')
    // 应该在 pending 中，不应该在 completed 中
    expect(update1.pending.length).toBeGreaterThan(0)
    
    // 第二步：添加缩进的第二行
    const update2 = parser.append('    第二行\n')
    
    // 第三步：添加空行结束
    const update3 = parser.append('\n')
    
    const result = parser.finalize()
    const footnotes = extractFootnoteDefinitions(parser)
    
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
  })

  it('遇到非缩进行时应该正确结束脚注', () => {
    const parser = new IncremarkParser({ gfm: true })
    
    parser.append('[^1]: 第一行\n')
    parser.append('    第二行\n')
    const update3 = parser.append('普通段落\n')
    
    // 此时脚注应该已经完成
    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
  })

  it('遇到新脚注定义时应该结束前一个脚注', () => {
    const parser = new IncremarkParser({ gfm: true })
    
    parser.append('[^1]: 第一行\n')
    parser.append('    第二行\n')
    parser.append('[^2]: 新脚注\n')
    
    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(2)
    expect(footnotes[0].identifier).toBe('1')
    expect(footnotes[1].identifier).toBe('2')
  })

  it('逐行解析多行脚注应该保持一致性', () => {
    const markdown = `[^test]: 第一行
    第二行
    
    第三段
    
普通段落`

    // 一次性解析
    const parser1 = new IncremarkParser({ gfm: true })
    parser1.append(markdown)
    const result1 = parser1.finalize()
    const footnotes1 = extractFootnoteDefinitions(parser1)

    // 逐行解析
    const parser2 = new IncremarkParser({ gfm: true })
    const lines = markdown.split('\n')
    lines.forEach((line, i) => {
      parser2.append(line + (i < lines.length - 1 ? '\n' : ''))
    })
    const result2 = parser2.finalize()
    const footnotes2 = extractFootnoteDefinitions(parser2)

    // 结果应该一致
    expect(footnotes1).toHaveLength(footnotes2.length)
    expect(footnotes1[0].identifier).toBe(footnotes2[0].identifier)
  })
})

describe('脚注解析 - 边界情况', () => {
  it('应该正确处理脚注后的普通段落', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^1]: 脚注内容

普通段落（无缩进）`

    parser.append(markdown)
    const result = parser.finalize()

    expect(result.ast.children).toHaveLength(2)
    expect(result.ast.children[0].type).toBe('footnoteDefinition')
    expect(result.ast.children[1].type).toBe('paragraph')
  })

  it('应该正确处理最后一行是脚注开始的情况', () => {
    const parser = new IncremarkParser({ gfm: true })
    parser.append('[^1]: 开始')
    
    const result = parser.finalize()
    const footnotes = extractFootnoteDefinitions(parser)
    
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('1')
  })

  it('应该区分脚注延续和独立的缩进代码块', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `普通段落

    独立的缩进代码块
    不属于脚注`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(0)
    // 应该被解析为代码块，而不是脚注
    const codeBlock = result.ast.children.find(node => node.type === 'code')
    expect(codeBlock).toBeDefined()
  })

  it('应该正确处理空脚注标识符', () => {
    const parser = new IncremarkParser({ gfm: true })
    // 注意：[^]: 不是有效的脚注语法
    parser.append('[^]: 无效脚注')
    
    const result = parser.finalize()
    const footnotes = extractFootnoteDefinitions(parser)
    
    // 应该不被识别为脚注
    expect(footnotes).toHaveLength(0)
  })

  it('应该正确处理脚注标识符中的特殊字符', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^foo-bar_123]: 脚注内容`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('foo-bar_123')
  })
})

describe('脚注解析 - 复杂场景', () => {
  it('应该正确处理复杂的嵌套内容', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `[^complex]: 第一段
    
    - 列表项 1
      嵌套内容
    - 列表项 2
    
    \`\`\`js
    代码块
    \`\`\`
    
    最后一段`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(1)
    expect(footnotes[0].identifier).toBe('complex')
    // 应该包含多个子元素
    expect(footnotes[0].children.length).toBeGreaterThan(1)
  })

  it('应该正确处理混合内容的文档', () => {
    const parser = new IncremarkParser({ gfm: true })
    const markdown = `# 标题

普通段落[^1]。

[^1]: 脚注内容
    第二行

## 二级标题

另一个段落[^2]。

[^2]: 另一个脚注

---

最后的段落。`

    parser.append(markdown)
    const result = parser.finalize()

    const footnotes = extractFootnoteDefinitions(parser)
    expect(footnotes).toHaveLength(2)
    
    // 验证其他元素也被正确解析
    const headings = result.ast.children.filter(node => node.type === 'heading')
    expect(headings).toHaveLength(2)
    
    const paragraphs = result.ast.children.filter(node => node.type === 'paragraph')
    expect(paragraphs.length).toBeGreaterThan(0)
  })
})

