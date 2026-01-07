import { describe, it, expect } from 'vitest'
import { MarkedAstBuilder } from '../parser/ast/MarkedAstBuildter'
import { MicromarkAstBuilder } from '../parser/ast/MicromarkAstBuilder'

/**
 * HTML 块中包含空行的解析测试
 *
 * CommonMark 规范中，HTML 块会在空行处被截断。
 * 这个测试验证 html-extension 的合并逻辑能正确处理被分割的 HTML 节点。
 */
describe('HTML 块空行处理', () => {
  const fullOptions = { gfm: true, htmlTree: true }

  describe('无空行', () => {
    const md = `<div>
sd
aa
</div>`

    it('MarkedAstBuilder 应输出完整的 htmlElement', () => {
      const builder = new MarkedAstBuilder(fullOptions)
      const ast = builder.parse(md)
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })

    it('MicromarkAstBuilder 应输出完整的 htmlElement', () => {
      const builder = new MicromarkAstBuilder(fullOptions)
      const ast = builder.parse(md)
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })
  })

  describe('单空行', () => {
    const md = `<div>
sd
aa

</div>`

    it('MarkedAstBuilder 应合并分割的 HTML 节点', () => {
      const builder = new MarkedAstBuilder(fullOptions)
      const ast = builder.parse(md)
      // 合并后应该只有一个 htmlElement
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })

    it('MicromarkAstBuilder 应合并分割的 HTML 节点', () => {
      const builder = new MicromarkAstBuilder(fullOptions)
      const ast = builder.parse(md)
      // 合并后应该只有一个 htmlElement
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })
  })

  describe('多空行', () => {
    const md = `<div>
sd
aa



</div>`

    it('MarkedAstBuilder 应合并分割的 HTML 节点', () => {
      const builder = new MarkedAstBuilder(fullOptions)
      const ast = builder.parse(md)
      // 合并后应该只有一个 htmlElement
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })

    it('MicromarkAstBuilder 应合并分割的 HTML 节点', () => {
      const builder = new MicromarkAstBuilder(fullOptions)
      const ast = builder.parse(md)
      // 合并后应该只有一个 htmlElement
      expect(ast.children.length).toBe(1)
      expect((ast.children[0] as any).type).toBe('htmlElement')
      expect((ast.children[0] as any).tagName).toBe('div')
    })
  })

  // 注意：嵌套 HTML 中包含空行的情况更复杂，
  // 因为 CommonMark 解析器会在多个位置截断 HTML 块。
  // 当前的合并逻辑主要处理简单的开标签-内容-闭标签模式。
  // 多层嵌套的 HTML 需要更复杂的处理逻辑，暂不支持。
})
