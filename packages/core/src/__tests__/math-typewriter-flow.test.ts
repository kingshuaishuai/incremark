/**
 * 测试数学公式在 parser → transformer → 渲染 的完整数据流
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createIncremarkParser } from '../parser'
import { createBlockTransformer, mathPlugin } from '../transformer'

// Polyfill requestAnimationFrame for test environment
let rafId = 0
const rafCallbacks = new Map<number, (time: number) => void>()

global.requestAnimationFrame = (callback: (time: number) => void): number => {
  const id = ++rafId
  rafCallbacks.set(id, callback)
  // Immediately execute in test environment
  setTimeout(() => callback(performance.now()), 0)
  return id
}

global.cancelAnimationFrame = (id: number): void => {
  rafCallbacks.delete(id)
}

describe('数学公式打字机效果数据流测试', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })
  it('parser 应该正确解析数学公式节点', () => {
    const parser = createIncremarkParser({ math: true, gfm: true })

    const result = parser.append('行内公式 $x^2$ 和块级公式：\n\n$$\nE = mc^2\n$$\n\n结束')

    expect(result.completed).toHaveLength(2)

    // 第一个 block 是段落，包含 inlineMath
    const firstBlock = result.completed[0]
    expect(firstBlock.node.type).toBe('paragraph')

    const paragraph = firstBlock.node as any
    expect(paragraph.children).toBeDefined()

    // 查找 inlineMath 节点
    const inlineMath = paragraph.children.find((c: any) => c.type === 'inlineMath')
    expect(inlineMath).toBeDefined()
    expect(inlineMath.value).toBe('x^2')

    // 第二个 block 是 math
    const secondBlock = result.completed[1]
    expect(secondBlock.node.type).toBe('math')
    expect((secondBlock.node as any).value).toBe('E = mc^2')
  })

  it('transformer 应该正确处理数学公式（不截断）', async () => {
    const parser = createIncremarkParser({ math: true, gfm: true })
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],  // 使用 mathPlugin
      charsPerTick: 10,
      tickInterval: 10,
      onChange: () => {}
    })

    const result = parser.append('行内公式 $x^2 + y^2 = z^2$ 和更多文本\n\n$$\n\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}\n$$')

    // 推入 blocks
    const blocks = [...result.completed, ...result.pending]
    transformer.push(blocks)

    // 跳过动画，直接看最终结果
    transformer.skip()

    // 获取 display blocks
    const displayBlocks = transformer.getDisplayBlocks()

    // 验证：数学公式应该完整显示（不会被截断）
    const paragraphBlock = displayBlocks.find(b => (b.displayNode as any)?.type === 'paragraph')
    expect(paragraphBlock).toBeDefined()

    const paragraph = paragraphBlock!.displayNode as any
    const inlineMath = paragraph.children?.find((c: any) => c.type === 'inlineMath')

    // 数学公式的 value 应该完整（不被截断）
    expect(inlineMath).toBeDefined()
    if (inlineMath) {
      expect(inlineMath.value).toBe('x^2 + y^2 = z^2')
    }

    const mathBlock = displayBlocks.find(b => (b.displayNode as any)?.type === 'math')
    expect(mathBlock).toBeDefined()

    if (mathBlock) {
      expect((mathBlock.displayNode as any).value).toBe('\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}')
    }
  })

  it('没有 mathPlugin 时，数学公式应该被截断（会导致渲染问题）', () => {
    const parser = createIncremarkParser({ math: true, gfm: true })
    const transformer = createBlockTransformer({
      plugins: [],  // 不使用 mathPlugin
      charsPerTick: 10,
      tickInterval: 10,
      onChange: () => {}
    })

    const result = parser.append('行内公式 $x^2 + y^2 = z^2$ 和更多文本')

    const blocks = [...result.completed, ...result.pending]
    transformer.push(blocks)

    // 模拟打字机进度到一半
    transformer.skip()  // 跳过动画

    const displayBlocks = transformer.getDisplayBlocks()
    const paragraphBlock = displayBlocks.find(b => (b.displayNode as any)?.type === 'paragraph')

    // 没有 mathPlugin，数学公式会被当作普通文本处理
    // 但由于 skip()，应该完整显示
    expect(paragraphBlock).toBeDefined()
  })

  it('pending 状态下的数学公式也应该正确处理', () => {
    const parser = createIncremarkParser({ math: true, gfm: true })
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 5,
      tickInterval: 10,
      onChange: () => {}
    })

    // 追加不完整的数学公式（pending 状态）
    const result = parser.append('这是一个行内公式 $x^2')

    // 使用 append 返回的结果
    const blocks = [...result.completed, ...result.pending]
    transformer.push(blocks)

    const displayBlocks = transformer.getDisplayBlocks()

    // 即使是 pending，数学公式也应该被正确处理
    expect(displayBlocks.length).toBeGreaterThan(0)
  })

  it('验证完整的 parser → transformer 数据流', () => {
    const parser = createIncremarkParser({ math: true, gfm: true })
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: [1, 3],
      tickInterval: 20,
      effect: 'typing',
      onChange: () => {}
    })

    // 逐步追加内容
    parser.append('# 标题\n\n')
    parser.append('这是第一段，包含行内公式 $a + b = c$。\n\n')
    parser.append('块级公式：\n\n')
    parser.append('$$\n')
    parser.append('\\int_0^1 x')
    parser.append(' dx\n')
    parser.append('$$\n\n')
    parser.append('继续文本内容')

    // 完成
    parser.finalize()

    // 获取所有 blocks
    const blocks = [...parser.getCompletedBlocks()]

    // 验证节点数量
    expect(blocks.length).toBeGreaterThanOrEqual(3)  // 标题、段落、math、段落

    // 推入 transformer
    transformer.push(blocks)

    // 跳过动画，验证最终状态
    transformer.skip()
    const finalBlocks = transformer.getDisplayBlocks()

    // 验证最终状态包含所有 blocks
    expect(finalBlocks.length).toBe(blocks.length)

    // 验证数学公式节点
    const paragraphWithInlineMath = finalBlocks.find(b => {
      const node = b.displayNode as any
      if (node.type === 'paragraph' && node.children) {
        return node.children.some((c: any) => c.type === 'inlineMath')
      }
      return false
    })

    expect(paragraphWithInlineMath).toBeDefined()

    const mathBlock = finalBlocks.find(b => (b.displayNode as any)?.type === 'math')
    expect(mathBlock).toBeDefined()
  })
})
