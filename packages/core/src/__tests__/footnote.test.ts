/**
 * 脚注解析测试
 * 
 * 测试增量解析场景下的脚注引用和定义
 */

import { describe, it, expect } from 'vitest'
import { createIncremarkParser } from '../parser/IncremarkParser'

describe('Footnote Parsing', () => {
  describe('Basic Footnote', () => {
    it('should parse footnote reference before definition', () => {
      const markdown = `这是一个简单的脚注[^1]。

[^1]: 这是第一个脚注的内容。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 检查是否有脚注引用
      const paragraph = ast.children[0]
      expect(paragraph.type).toBe('paragraph')
      
      const hasFootnoteRef = paragraph.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === '1'
      )
      expect(hasFootnoteRef).toBe(true)

      // 检查是否有脚注定义
      const hasFootnoteDef = ast.children.some(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === '1'
      )
      expect(hasFootnoteDef).toBe(true)
    })

    it('should parse multiple footnotes', () => {
      const markdown = `第一个脚注[^1]，第二个脚注[^2]。

[^1]: 第一个内容。
[^2]: 第二个内容。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 检查两个脚注引用
      const paragraph = ast.children[0]
      const footnoteRefs = paragraph.children?.filter(
        (node: any) => node.type === 'footnoteReference'
      )
      expect(footnoteRefs).toHaveLength(2)
      expect(footnoteRefs?.[0].identifier).toBe('1')
      expect(footnoteRefs?.[1].identifier).toBe('2')

      // 检查两个脚注定义
      const footnoteDefs = ast.children.filter(
        (node: any) => node.type === 'footnoteDefinition'
      )
      expect(footnoteDefs).toHaveLength(2)
      expect(footnoteDefs[0].identifier).toBe('1')
      expect(footnoteDefs[1].identifier).toBe('2')
    })
  })

  describe('Multiline Footnote', () => {
    it('should parse multiline footnote content', () => {
      const markdown = `多行脚注[^long]。

[^long]: 第一段内容。

    第二段内容（缩进）。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 检查脚注引用
      const paragraph = ast.children[0]
      const hasFootnoteRef = paragraph.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === 'long'
      )
      expect(hasFootnoteRef).toBe(true)

      // 检查脚注定义
      const footnoteDef = ast.children.find(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === 'long'
      ) as any
      expect(footnoteDef).toBeDefined()
      
      // 检查脚注内容是否包含多个段落
      expect(footnoteDef.children.length).toBeGreaterThan(1)
    })
  })

  describe('Incremental Parsing', () => {
    it('should handle footnote reference in pending block', () => {
      const parser = createIncremarkParser({ gfm: true })

      // 第一次追加：只有引用（没有空行，保持在 pending 状态）
      const update1 = parser.append('这是一个脚注[^1]。')

      // 检查 pending blocks 中是否有脚注引用
      const pendingParagraph = update1.pending[0]?.node
      const hasPendingRef = pendingParagraph?.children?.some(
        (node: any) => node.type === 'footnoteReference'
      )
      expect(hasPendingRef).toBe(true)

      // 第二次追加：添加换行和定义
      const update2 = parser.append('\n\n[^1]: 脚注内容。')
      parser.finalize()

      // 检查最终 AST
      const ast = parser.getAst()
      const hasFootnoteDef = ast.children.some(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === '1'
      )
      expect(hasFootnoteDef).toBe(true)
    })

    it('should handle definition before reference', () => {
      const markdown = `[^1]: 脚注内容。

这是一个脚注[^1]。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 即使定义在前，引用也应该被正确解析
      const paragraph = ast.children.find((node: any) => node.type === 'paragraph')
      const hasFootnoteRef = paragraph?.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === '1'
      )
      expect(hasFootnoteRef).toBe(true)

      const hasFootnoteDef = ast.children.some(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === '1'
      )
      expect(hasFootnoteDef).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle footnote with special characters in identifier', () => {
      const markdown = `脚注[^note-1]。

[^note-1]: 内容。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      const paragraph = ast.children[0]
      const hasFootnoteRef = paragraph.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === 'note-1'
      )
      expect(hasFootnoteRef).toBe(true)
    })

    it('should handle footnote with markdown in content', () => {
      const markdown = `脚注[^complex]。

[^complex]: 包含 **粗体** 和 *斜体*。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      const footnoteDef = ast.children.find(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === 'complex'
      ) as any
      expect(footnoteDef).toBeDefined()

      // 检查脚注内容是否包含格式化文本
      const paragraph = footnoteDef.children[0]
      const hasStrong = paragraph.children?.some((node: any) => node.type === 'strong')
      const hasEmphasis = paragraph.children?.some((node: any) => node.type === 'emphasis')
      expect(hasStrong || hasEmphasis).toBe(true)
    })

    it('should not parse invalid footnote syntax', () => {
      const markdown = `这不是脚注[^ 1]。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 空格会导致解析失败，应该被当作普通文本
      const paragraph = ast.children[0]
      const hasFootnoteRef = paragraph.children?.some(
        (node: any) => node.type === 'footnoteReference'
      )
      expect(hasFootnoteRef).toBe(false)
    })
  })

  describe('Footnote Reference Order', () => {
    it('should track footnote reference order', () => {
      const markdown = `第二个[^2]出现在第一个[^1]之前。

[^1]: 第一个定义。
[^2]: 第二个定义。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)

      // 检查引用顺序
      expect(result.footnoteReferenceOrder).toEqual(['2', '1'])
    })
  })
})

