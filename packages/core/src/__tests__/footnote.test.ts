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
      const paragraph = ast.children?.[0] as any
      expect(paragraph?.type).toBe('paragraph')
      
      const hasFootnoteRef = paragraph?.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === '1'
      )
      expect(hasFootnoteRef).toBe(true)

      // 检查是否有脚注定义
      const hasFootnoteDef = (ast.children as any)?.some(
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
      const paragraph = ast.children?.[0] as any
      const footnoteRefs = paragraph?.children?.filter(
        (node: any) => node.type === 'footnoteReference'
      ) as any[] || []

      expect(footnoteRefs).toHaveLength(2)
      expect(footnoteRefs?.[0]?.identifier).toBe('1')
      expect(footnoteRefs?.[1]?.identifier).toBe('2')

      // 检查两个脚注定义
      const footnoteDefs = (ast.children as any)?.filter(
        (node: any) => node.type === 'footnoteDefinition'
      ) as any[] || []

      expect(footnoteDefs).toHaveLength(2)
      expect(footnoteDefs[0]?.identifier).toBe('1')
      expect(footnoteDefs[1]?.identifier).toBe('2')
    })
  })

  describe('Multiline Footnote', () => {
    it('should parse multiline footnote content', () => {
      const markdown = `多行脚注[^long]。

[^long]: 第一段内容。

    这是第二段内容（缩进）。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      // 检查脚注引用
      const paragraph = ast.children?.[0] as any
      const hasFootnoteRef = paragraph?.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === 'long'
      )
      expect(hasFootnoteRef).toBe(true)

      // 检查脚注定义
      const footnoteDef = (ast.children as any)?.find(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === 'long'
      ) as any

      expect(footnoteDef).toBeDefined()
      
      // 检查脚注内容是否包含多个段落
      expect(footnoteDef?.children?.length ?? 0).toBeGreaterThan(1)
    })
  })

  describe('Incremental Parsing', () => {
    it('should handle footnote reference in pending block', () => {
      const parser = createIncremarkParser({ gfm: true })

      // 第一次追加：只有引用（没有空行，保持在 pending 状态）
      const update1 = parser.append('这是一个脚注[^1]。')

      // 检查 pending blocks 中是否有脚注引用
      const pendingParagraph = update1.pending?.[0]?.node as any
      const hasPendingRef = pendingParagraph?.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === '1'
      )
      expect(hasPendingRef).toBe(true)

      // 第二次追加：添加换行和定义
      parser.append('\n\n[^1]: 脚注内容。')
      parser.finalize()

      // 检查最终 AST
      const ast = parser.getAst()
      const hasFootnoteDef = (ast.children as any)?.some(
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
      const paragraph = ast.children?.find((node: any) => node.type === 'paragraph') as any
      const hasFootnoteRef = paragraph?.children?.some(
        (node: any) => node.type === 'footnoteReference' && node.identifier === '1'
      )
      expect(hasFootnoteRef).toBe(true)

      const hasFootnoteDef = (ast.children as any)?.some(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === '1'
      )
      expect(hasFootnoteDef).toBe(true)
    })
  })

  describe('Complex Footnote Scenarios', () => {
    it('should parse footnote with list inside', () => {
      const markdown = `这个脚注包含列表[^list]。

[^list]: 这是说明文字。

    - 列表项 1
    - 列表项 2
    - 列表项 3

    列表后的段落。`

      const parser = createIncremarkParser({ gfm: true })
      const result = parser.render(markdown)
      const ast = result.ast

      const footnoteDef = (ast.children as any)?.find(
        (node: any) => node.type === 'footnoteDefinition' && node.identifier === 'list'
      ) as any

      expect(footnoteDef).toBeDefined()
      
      // 脚注应该包含3个子节点：段落、列表、段落
      expect(footnoteDef?.children?.length ?? 0).toBe(3)
      expect(footnoteDef?.children?.[0]?.type).toBe('paragraph')
      expect(footnoteDef?.children?.[1]?.type).toBe('list')
      expect(footnoteDef?.children?.[2]?.type).toBe('paragraph')
    })
  })
})
