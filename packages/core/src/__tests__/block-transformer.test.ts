/**
 * BlockTransformer 全面测试
 *
 * 测试覆盖范围：
 * 1. 基础功能：push、update、skip、reset、pause、resume
 * 2. 复杂嵌套结构：多层容器、列表嵌套、引用块嵌套
 * 3. 边缘情况：空内容、超长内容、快速连续更新
 * 4. 状态同步：pending → completed 转换、block 移除
 * 5. 动画效果：none、fade-in、typing
 * 6. 插件系统：自定义字符数计算、自定义截断
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { createBlockTransformer, mathPlugin, defaultPlugins } from '../transformer'
import { createIncremarkParser } from '../parser'
import type { RootContent } from 'mdast'
import type { BlockTransformer, SourceBlock, DisplayBlock } from '../transformer'

// ============ Polyfill requestAnimationFrame ============
let rafId = 0
const rafCallbacks = new Map<number, (time: number) => void>()

global.requestAnimationFrame = (callback: (time: number) => void): number => {
  const id = ++rafId
  rafCallbacks.set(id, callback)
  setTimeout(() => callback(performance.now()), 0)
  return id
}

global.cancelAnimationFrame = (id: number): void => {
  rafCallbacks.delete(id)
}

// ============ 辅助函数 ============

/** 创建简单的段落 block */
function createParagraphBlock(id: string, text: string, status: 'pending' | 'completed' = 'pending'): SourceBlock {
  return {
    id,
    node: { type: 'paragraph', children: [{ type: 'text', value: text }] } as RootContent,
    status
  }
}

/** 创建代码块 */
function createCodeBlock(id: string, code: string, lang = 'js', status: 'pending' | 'completed' = 'pending'): SourceBlock {
  return {
    id,
    node: { type: 'code', lang, value: code } as RootContent,
    status
  }
}

/** 创建列表 block */
function createListBlock(id: string, items: string[], status: 'pending' | 'completed' = 'pending'): SourceBlock {
  return {
    id,
    node: {
      type: 'list',
      children: items.map(item => ({
        type: 'listItem',
        children: [{ type: 'paragraph', children: [{ type: 'text', value: item }] }]
      }))
    } as RootContent,
    status
  }
}

/** 创建引用块 */
function createBlockquoteBlock(id: string, text: string, status: 'pending' | 'completed' = 'pending'): SourceBlock {
  return {
    id,
    node: {
      type: 'blockquote',
      children: [{ type: 'paragraph', children: [{ type: 'text', value: text }] }]
    } as RootContent,
    status
  }
}

/** 创建嵌套容器 */
function createNestedContainerBlock(
  id: string,
  children: RootContent[],
  status: 'pending' | 'completed' = 'pending'
): SourceBlock {
  return {
    id,
    node: { type: 'containerDirective', children } as RootContent,
    status
  }
}

/** 等待指定时间 */
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// ============ 测试套件 ============

describe('BlockTransformer 基础功能', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  describe('push 方法', () => {
    it('应该正确添加新的 blocks', async () => {
      const onChange = vi.fn()
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10,
        onChange
      })

      transformer.push([
        createParagraphBlock('0', 'Hello'),
        createParagraphBlock('10', 'World')
      ])

      await wait(50)

      const blocks = transformer.getDisplayBlocks()
      expect(blocks).toHaveLength(2)
      expect(blocks[0].id).toBe('0')
      expect(blocks[1].id).toBe('10')
    })

    it('应该正确更新已存在 block 的内容', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10
      })

      // 第一次 push
      transformer.push([createParagraphBlock('0', 'Hello')])
      await wait(50)

      // 更新内容
      transformer.push([createParagraphBlock('0', 'Hello World')])
      await wait(50)

      const blocks = transformer.getDisplayBlocks()
      expect(blocks).toHaveLength(1)
      const textNode = (blocks[0].displayNode as any).children[0]
      expect(textNode.value).toBe('Hello World')
    })

    it('应该移除不在传入列表中的旧 blocks', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10
      })

      // 第一次 push：3 个 blocks
      transformer.push([
        createParagraphBlock('0', 'A'),
        createParagraphBlock('10', 'B'),
        createParagraphBlock('20', 'C')
      ])
      await wait(50)

      expect(transformer.getDisplayBlocks()).toHaveLength(3)

      // 第二次 push：只有 1 个 block
      transformer.push([createParagraphBlock('0', 'A only')])
      await wait(50)

      const blocks = transformer.getDisplayBlocks()
      expect(blocks).toHaveLength(1)
      expect(blocks[0].id).toBe('0')
    })

    it('应该正确处理空数组输入', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10
      })

      transformer.push([createParagraphBlock('0', 'Hello')])
      await wait(50)

      expect(transformer.getDisplayBlocks()).toHaveLength(1)

      // 传入空数组应该移除所有 blocks
      transformer.push([])
      await wait(50)

      expect(transformer.getDisplayBlocks()).toHaveLength(0)
    })
  })

  describe('update 方法', () => {
    it('应该更新当前正在处理的 block', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 2,  // 慢速处理
        tickInterval: 10
      })

      transformer.push([createParagraphBlock('0', 'Hello World')])
      await wait(30)

      // 在处理中更新内容
      transformer.update(createParagraphBlock('0', 'Hello World!!!'))
      await wait(100)

      const blocks = transformer.getDisplayBlocks()
      expect(blocks).toHaveLength(1)
    })

    it('应该更新已完成的 block', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10
      })

      transformer.push([createParagraphBlock('0', 'Hello', 'completed')])
      await wait(50)

      transformer.update(createParagraphBlock('0', 'Hello Updated', 'completed'))
      await wait(50)

      const blocks = transformer.getDisplayBlocks()
      const textNode = (blocks[0].displayNode as any).children[0]
      expect(textNode.value).toBe('Hello Updated')
    })
  })

  describe('skip 方法', () => {
    it('应该立即完成所有动画', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1,  // 非常慢
        tickInterval: 50
      })

      transformer.push([
        createParagraphBlock('0', 'A'.repeat(100)),
        createParagraphBlock('100', 'B'.repeat(100))
      ])

      // 不等待，直接 skip
      transformer.skip()

      const blocks = transformer.getDisplayBlocks()
      expect(blocks).toHaveLength(2)
      expect(blocks[0].isDisplayComplete).toBe(true)
      expect(blocks[1].isDisplayComplete).toBe(true)
    })

    it('skip 后 isProcessing 应该返回 false', () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1,
        tickInterval: 50
      })

      transformer.push([createParagraphBlock('0', 'A'.repeat(100))])
      expect(transformer.isProcessing()).toBe(true)

      transformer.skip()
      expect(transformer.isProcessing()).toBe(false)
    })
  })

  describe('reset 方法', () => {
    it('应该清空所有状态', async () => {
      const transformer = createBlockTransformer({
        charsPerTick: 1000,
        tickInterval: 10
      })

      transformer.push([
        createParagraphBlock('0', 'Hello'),
        createParagraphBlock('10', 'World')
      ])
      await wait(50)

      expect(transformer.getDisplayBlocks()).toHaveLength(2)

      transformer.reset()

      expect(transformer.getDisplayBlocks()).toHaveLength(0)
      expect(transformer.isProcessing()).toBe(false)
    })
  })

  describe('pause 和 resume 方法', () => {
    it('pause 应该暂停动画', async () => {
      const onChange = vi.fn()
      const transformer = createBlockTransformer({
        charsPerTick: 1,
        tickInterval: 10,
        onChange
      })

      transformer.push([createParagraphBlock('0', 'A'.repeat(50))])
      await wait(30)

      const callCountBefore = onChange.mock.calls.length

      transformer.pause()
      expect(transformer.isPausedState()).toBe(true)

      await wait(50)

      // 暂停后不应该有新的 onChange 调用
      expect(onChange.mock.calls.length).toBe(callCountBefore)
    })

    it('resume 应该恢复动画', async () => {
      const onChange = vi.fn()
      const transformer = createBlockTransformer({
        charsPerTick: 5,
        tickInterval: 10,
        onChange
      })

      transformer.push([createParagraphBlock('0', 'A'.repeat(50))])
      await wait(20)

      transformer.pause()
      const callCountPaused = onChange.mock.calls.length

      transformer.resume()
      expect(transformer.isPausedState()).toBe(false)

      await wait(50)

      // 恢复后应该有新的 onChange 调用
      expect(onChange.mock.calls.length).toBeGreaterThan(callCountPaused)
    })
  })
})

describe('BlockTransformer 复杂嵌套结构', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('应该正确处理深层嵌套的容器', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // 创建 3 层嵌套的容器
    const deepNested: SourceBlock = {
      id: '0',
      node: {
        type: 'containerDirective',
        children: [
          {
            type: 'containerDirective',
            children: [
              {
                type: 'containerDirective',
                children: [
                  { type: 'paragraph', children: [{ type: 'text', value: '最深层内容' }] }
                ]
              }
            ]
          }
        ]
      } as RootContent,
      status: 'completed'
    }

    transformer.push([deepNested])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('应该正确处理嵌套列表', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    const nestedList: SourceBlock = {
      id: '0',
      node: {
        type: 'list',
        children: [
          {
            type: 'listItem',
            children: [
              { type: 'paragraph', children: [{ type: 'text', value: '项目 1' }] },
              {
                type: 'list',
                children: [
                  {
                    type: 'listItem',
                    children: [
                      { type: 'paragraph', children: [{ type: 'text', value: '子项目 1.1' }] },
                      {
                        type: 'list',
                        children: [
                          {
                            type: 'listItem',
                            children: [
                              { type: 'paragraph', children: [{ type: 'text', value: '孙项目 1.1.1' }] }
                            ]
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      } as RootContent,
      status: 'completed'
    }

    transformer.push([nestedList])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('应该正确处理引用块中的复杂内容', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    const complexBlockquote: SourceBlock = {
      id: '0',
      node: {
        type: 'blockquote',
        children: [
          { type: 'paragraph', children: [{ type: 'text', value: '引用开头' }] },
          {
            type: 'list',
            children: [
              { type: 'listItem', children: [{ type: 'paragraph', children: [{ type: 'text', value: '列表项' }] }] }
            ]
          },
          { type: 'code', lang: 'js', value: 'console.log("code in quote")' },
          {
            type: 'blockquote',
            children: [
              { type: 'paragraph', children: [{ type: 'text', value: '嵌套引用' }] }
            ]
          }
        ]
      } as RootContent,
      status: 'completed'
    }

    transformer.push([complexBlockquote])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect((blocks[0].displayNode as any).type).toBe('blockquote')
  })

  it('应该正确处理混合内容的复杂文档', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    const mixedContent: SourceBlock[] = [
      {
        id: '0',
        node: { type: 'heading', depth: 1, children: [{ type: 'text', value: '标题' }] } as RootContent,
        status: 'completed'
      },
      {
        id: '10',
        node: {
          type: 'paragraph',
          children: [
            { type: 'text', value: '这是 ' },
            { type: 'strong', children: [{ type: 'text', value: '粗体' }] },
            { type: 'text', value: ' 和 ' },
            { type: 'emphasis', children: [{ type: 'text', value: '斜体' }] },
            { type: 'text', value: ' 文本' }
          ]
        } as RootContent,
        status: 'completed'
      },
      {
        id: '50',
        node: { type: 'code', lang: 'typescript', value: 'const x: number = 1;' } as RootContent,
        status: 'completed'
      },
      {
        id: '100',
        node: {
          type: 'table',
          children: [
            {
              type: 'tableRow',
              children: [
                { type: 'tableCell', children: [{ type: 'text', value: 'A' }] },
                { type: 'tableCell', children: [{ type: 'text', value: 'B' }] }
              ]
            }
          ]
        } as RootContent,
        status: 'completed'
      }
    ]

    transformer.push(mixedContent)
    await wait(100)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(4)
    expect(blocks.every(b => b.isDisplayComplete)).toBe(true)
  })
})

describe('BlockTransformer 边缘情况', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('应该正确处理空文本内容', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    transformer.push([createParagraphBlock('0', '')])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('应该正确处理超长文本', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 100,
      tickInterval: 10
    })

    const longText = 'A'.repeat(10000)
    transformer.push([createParagraphBlock('0', longText)])

    // 直接 skip
    transformer.skip()

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
    expect((blocks[0].displayNode as any).children[0].value).toBe(longText)
  })

  it('应该正确处理快速连续的 push 调用', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // 快速连续 push
    for (let i = 0; i < 10; i++) {
      transformer.push([createParagraphBlock('0', `Version ${i}`)])
    }

    await wait(100)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    // 应该是最后一个版本
    expect((blocks[0].displayNode as any).children[0].value).toBe('Version 9')
  })

  it('应该正确处理 block ID 变化', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // 第一次 push
    transformer.push([
      createParagraphBlock('0', 'A'),
      createParagraphBlock('10', 'B')
    ])
    await wait(50)

    // ID 完全变化
    transformer.push([
      createParagraphBlock('100', 'C'),
      createParagraphBlock('200', 'D')
    ])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(2)
    expect(blocks[0].id).toBe('100')
    expect(blocks[1].id).toBe('200')
  })

  it('应该正确处理相同 ID 不同类型的 block', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // 第一次 push：段落
    transformer.push([createParagraphBlock('0', 'Hello')])
    await wait(50)

    // 第二次 push：相同 ID 但变成代码块
    transformer.push([createCodeBlock('0', 'console.log("Hello")')])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect((blocks[0].displayNode as any).type).toBe('code')
  })

  it('应该正确处理 Unicode 和特殊字符', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    const unicodeText = '你好世界 🎉 مرحبا العالم こんにちは世界 🚀✨'
    transformer.push([createParagraphBlock('0', unicodeText)])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect((blocks[0].displayNode as any).children[0].value).toBe(unicodeText)
  })

  it('应该正确处理大量 blocks', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 5
    })

    const manyBlocks: SourceBlock[] = []
    for (let i = 0; i < 100; i++) {
      manyBlocks.push(createParagraphBlock(String(i * 10), `Block ${i}`, 'completed'))
    }

    transformer.push(manyBlocks)
    // 需要更长的时间来处理 100 个 blocks
    await wait(500)

    // 使用 skip 确保全部完成
    transformer.skip()

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(100)
  })
})

describe('BlockTransformer 状态同步', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('应该正确处理 pending → completed 转换', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // pending 状态（解析器状态）
    transformer.push([createParagraphBlock('0', 'Hello', 'pending')])
    await wait(50)

    // DisplayBlock.status 反映打字机动画状态，不是解析器状态
    // 动画完成后，status 应该是 'completed'
    expect(transformer.getDisplayBlocks()[0].isDisplayComplete).toBe(true)
    expect(transformer.getDisplayBlocks()[0].status).toBe('completed')

    // 解析器状态变成 completed，内容增加
    transformer.push([createParagraphBlock('0', 'Hello World', 'completed')])
    await wait(50)

    // 动画仍然完成
    expect(transformer.getDisplayBlocks()[0].isDisplayComplete).toBe(true)
    expect(transformer.getDisplayBlocks()[0].status).toBe('completed')
  })

  it('应该正确处理多个 blocks 的交错状态变化', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10
    })

    // 初始状态：全部 pending（解析器状态）
    transformer.push([
      createParagraphBlock('0', 'A', 'pending'),
      createParagraphBlock('10', 'B', 'pending'),
      createParagraphBlock('20', 'C', 'pending')
    ])
    await wait(100)

    // DisplayBlock.status 反映打字机动画状态
    // 由于 charsPerTick: 1000，所有短文本都会快速完成动画
    let blocks = transformer.getDisplayBlocks()
    // 第一个动画完成
    expect(blocks[0].isDisplayComplete).toBe(true)
    expect(blocks[0].status).toBe('completed')
    // 第二个和第三个可能也完成了（取决于处理速度）
    // 使用 isDisplayComplete 来验证

    // 解析器状态变化不影响打字机动画状态
    transformer.push([
      createParagraphBlock('0', 'A', 'completed'),
      createParagraphBlock('10', 'B', 'pending'),
      createParagraphBlock('20', 'C', 'pending')
    ])
    await wait(100)

    blocks = transformer.getDisplayBlocks()
    // 所有动画都应该完成了
    expect(blocks.every(b => b.isDisplayComplete)).toBe(true)
    expect(blocks.every(b => b.status === 'completed')).toBe(true)
  })

  it('应该正确处理 currentBlock 被移除的情况', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 2,  // 慢速处理
      tickInterval: 10
    })

    // push 一个需要较长时间处理的 block
    transformer.push([createParagraphBlock('0', 'A'.repeat(100))])
    await wait(30)  // 等待部分处理

    expect(transformer.isProcessing()).toBe(true)

    // 在处理中移除这个 block
    transformer.push([createParagraphBlock('999', 'New block')])
    await wait(50)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].id).toBe('999')
  })
})

describe('BlockTransformer 动画效果', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('none 效果应该正常工作', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 5,
      tickInterval: 10,
      effect: 'none'
    })

    transformer.push([createParagraphBlock('0', 'Hello World')])
    await wait(100)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('fade-in 效果应该正常工作', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 5,
      tickInterval: 10,
      effect: 'fade-in'
    })

    transformer.push([createParagraphBlock('0', 'Hello World')])
    await wait(100)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('typing 效果应该正常工作', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 5,
      tickInterval: 10,
      effect: 'typing'
    })

    transformer.push([createParagraphBlock('0', 'Hello World')])
    await wait(100)

    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('应该能动态切换效果', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10,
      effect: 'none'
    })

    expect(transformer.getEffect()).toBe('none')

    transformer.setOptions({ effect: 'fade-in' })
    expect(transformer.getEffect()).toBe('fade-in')

    transformer.setOptions({ effect: 'typing' })
    expect(transformer.getEffect()).toBe('typing')
  })
})

describe('BlockTransformer 回调和事件', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('onChange 应该在状态变化时被调用', async () => {
    const onChange = vi.fn()
    const transformer = createBlockTransformer({
      charsPerTick: 5,
      tickInterval: 10,
      onChange
    })

    transformer.push([createParagraphBlock('0', 'Hello')])
    await wait(100)

    expect(onChange).toHaveBeenCalled()
    expect(onChange.mock.calls.length).toBeGreaterThan(0)
  })

  it('onAllComplete 应该在所有动画完成时被调用', async () => {
    const onAllComplete = vi.fn()
    const transformer = createBlockTransformer({
      charsPerTick: 1000,
      tickInterval: 10,
      onAllComplete
    })

    transformer.push([
      createParagraphBlock('0', 'A'),
      createParagraphBlock('10', 'B')
    ])
    await wait(100)

    expect(onAllComplete).toHaveBeenCalled()
  })

  it('skip 后也应该触发 onAllComplete', () => {
    const onAllComplete = vi.fn()
    const transformer = createBlockTransformer({
      charsPerTick: 1,
      tickInterval: 50,
      onAllComplete
    })

    transformer.push([createParagraphBlock('0', 'A'.repeat(100))])
    transformer.skip()

    expect(onAllComplete).toHaveBeenCalled()
  })
})

describe('BlockTransformer 插件系统', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('mathPlugin 应该让数学公式立即显示', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 1,  // 非常慢
      tickInterval: 50,
      plugins: [mathPlugin]
    })

    const mathBlock: SourceBlock = {
      id: '0',
      node: { type: 'math', value: 'E = mc^2' } as RootContent,
      status: 'pending'
    }

    transformer.push([mathBlock])
    // 等待足够的时间让 tick 执行（mathPlugin 使字符数为 0，所以一个 tick 就完成）
    await wait(100)

    // 数学公式应该立即完成（因为 countChars 返回 0）
    const blocks = transformer.getDisplayBlocks()
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('自定义插件应该能控制字符数计算', async () => {
    const customPlugin = {
      name: 'custom',
      match: (node: RootContent) => node.type === 'code',
      countChars: () => 1  // 代码块只计算为 1 个字符
    }

    const transformer = createBlockTransformer({
      charsPerTick: 1,
      tickInterval: 10,
      plugins: [customPlugin]
    })

    transformer.push([createCodeBlock('0', 'A'.repeat(1000))])
    await wait(50)

    // 应该很快完成
    const blocks = transformer.getDisplayBlocks()
    expect(blocks[0].isDisplayComplete).toBe(true)
  })
})

describe('BlockTransformer 真实场景模拟', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('应该正确处理流式 Markdown 输入', async () => {
    const parser = createIncremarkParser({ gfm: true })
    const transformer = createBlockTransformer({
      charsPerTick: 50,
      tickInterval: 10,
      plugins: [...defaultPlugins, mathPlugin]
    })

    const chunks = [
      '# 标题\n\n',
      '这是一段文本。\n\n',
      '```javascript\n',
      'console.log("Hello");\n',
      '```\n\n',
      '- 列表项 1\n',
      '- 列表项 2\n'
    ]

    for (const chunk of chunks) {
      const result = parser.append(chunk)
      const allBlocks = [...result.completed, ...result.pending]
      transformer.push(allBlocks as SourceBlock[])
      await wait(30)
    }

    transformer.skip()
    const finalBlocks = transformer.getDisplayBlocks()

    // 验证最终状态
    expect(finalBlocks.length).toBeGreaterThanOrEqual(1)
    expect(finalBlocks.every(b => b.isDisplayComplete)).toBe(true)

    // 验证没有重复的 IDs
    const ids = finalBlocks.map(b => b.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('应该正确处理容器的增量解析', async () => {
    const parser = createIncremarkParser({ gfm: true, containers: true })
    const transformer = createBlockTransformer({
      charsPerTick: 100,
      tickInterval: 10,
      plugins: [...defaultPlugins, mathPlugin]
    })

    const chunks = [
      ':::info{title="信息"}\n',
      '这是容器内容。\n\n',
      '- 列表项\n',
      ':::\n'
    ]

    for (const chunk of chunks) {
      const result = parser.append(chunk)
      const allBlocks = [...result.completed, ...result.pending]
      transformer.push(allBlocks as SourceBlock[])
      await wait(30)
    }

    transformer.skip()
    const finalBlocks = transformer.getDisplayBlocks()

    // 应该只有一个容器 block
    const containerBlocks = finalBlocks.filter(b => (b.displayNode as any).type === 'containerDirective')
    expect(containerBlocks.length).toBe(1)

    // 不应该有容器内部的独立 blocks
    expect(finalBlocks.length).toBeLessThanOrEqual(2)  // 可能有容器前的其他 blocks
  })

  it('应该正确处理数学公式的增量解析', async () => {
    const parser = createIncremarkParser({ gfm: true, math: true })
    const transformer = createBlockTransformer({
      charsPerTick: 50,
      tickInterval: 10,
      plugins: [...defaultPlugins, mathPlugin]
    })

    const chunks = [
      '行内公式：$E = mc^2$\n\n',
      '块级公式：\n\n',
      '$$\n',
      '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}\n',
      '$$\n'
    ]

    for (const chunk of chunks) {
      const result = parser.append(chunk)
      const allBlocks = [...result.completed, ...result.pending]
      transformer.push(allBlocks as SourceBlock[])
      await wait(30)
    }

    transformer.skip()
    const finalBlocks = transformer.getDisplayBlocks()

    expect(finalBlocks.length).toBeGreaterThanOrEqual(1)
    expect(finalBlocks.every(b => b.isDisplayComplete)).toBe(true)
  })

  it('应该正确处理表格的增量解析', async () => {
    const parser = createIncremarkParser({ gfm: true })
    const transformer = createBlockTransformer({
      charsPerTick: 50,
      tickInterval: 10
    })

    const chunks = [
      '| 列 1 | 列 2 |\n',
      '|------|------|\n',
      '| A    | B    |\n',
      '| C    | D    |\n'
    ]

    for (const chunk of chunks) {
      const result = parser.append(chunk)
      const allBlocks = [...result.completed, ...result.pending]
      transformer.push(allBlocks as SourceBlock[])
      await wait(30)
    }

    parser.finalize()
    transformer.skip()

    const finalBlocks = transformer.getDisplayBlocks()
    const tableBlock = finalBlocks.find(b => (b.displayNode as any).type === 'table')
    expect(tableBlock).toBeDefined()
  })
})

describe('BlockTransformer 性能和稳定性', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('应该在高频更新下保持稳定', async () => {
    const transformer = createBlockTransformer({
      charsPerTick: 10,
      tickInterval: 5
    })

    // 模拟高频更新
    for (let i = 0; i < 50; i++) {
      transformer.push([createParagraphBlock('0', 'A'.repeat(i + 1))])
      await wait(5)
    }

    transformer.skip()
    const blocks = transformer.getDisplayBlocks()
    expect(blocks).toHaveLength(1)
    expect(blocks[0].isDisplayComplete).toBe(true)
  })

  it('destroy 后不应该再触发回调', async () => {
    const onChange = vi.fn()
    const transformer = createBlockTransformer({
      charsPerTick: 1,
      tickInterval: 10,
      onChange
    })

    transformer.push([createParagraphBlock('0', 'A'.repeat(100))])
    await wait(20)

    const callCountBefore = onChange.mock.calls.length
    transformer.destroy()

    await wait(50)

    // destroy 后不应该有新的调用
    expect(onChange.mock.calls.length).toBe(callCountBefore)
  })
})
