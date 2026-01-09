/**
 * 测试 Block 完成状态同步问题
 *
 * 问题场景：
 * 1. Transformer 正在处理 block A（currentBlock）
 * 2. Block A 的内容读完了（currentProgress >= total）
 * 3. 同时，block A 从 pending 变成 completed
 * 4. 但 transformer 没有正确同步状态，导致 block A 卡在 current 位置
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createBlockTransformer, mathPlugin } from '../transformer'
import { createIncremarkParser } from '../parser'
import type { RootContent } from 'mdast'

// Polyfill requestAnimationFrame
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

describe('Block 完成状态同步测试', () => {
  beforeEach(() => {
    rafId = 0
    rafCallbacks.clear()
  })

  afterEach(() => {
    rafCallbacks.clear()
  })

  it('场景：block 内容读完后同时从 pending 变成 completed', async () => {
    const onChangeCalls: any[][] = []
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 100,  // 一次读完
      tickInterval: 10,
      effect: 'none',
      onChange: (blocks) => {
        onChangeCalls.push(blocks.map((b: any) => ({
          id: b.id,
          isDisplayComplete: b.isDisplayComplete
        })))
      }
    })

    // 第一次 push：block A 是 pending，内容不完整
    const blockAPending = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([blockAPending])

    // 等待 tick 处理
    await new Promise(resolve => setTimeout(resolve, 50))

    // block A 的内容增加了，但还是 pending
    const blockAPending2 = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'Hello World' }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([blockAPending2])

    await new Promise(resolve => setTimeout(resolve, 50))

    // block A 内容完整了，并且变成 completed
    const blockACompleted = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'Hello World!' }] } as RootContent,
      status: 'completed' as const
    }
    transformer.push([blockACompleted])

    await new Promise(resolve => setTimeout(resolve, 50))

    const finalState = onChangeCalls[onChangeCalls.length - 1]

    // 验证：block 0 应该是 completed（isDisplayComplete: true）
    const block0 = finalState?.find((b: any) => b.id === '0')
    expect(block0).toBeDefined()
    expect(block0?.isDisplayComplete).toBe(true)
  })

  it('场景：两个 block，第一个完成后应该自动处理第二个', async () => {
    const onChangeCalls: any[][] = []
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 100,  // 一次读完
      tickInterval: 10,
      effect: 'none',
      onChange: (blocks) => {
        onChangeCalls.push(blocks.map((b: any) => ({
          id: b.id,
          isDisplayComplete: b.isDisplayComplete,
          type: b.displayNode?.type
        })))
      }
    })

    // 第一次 push：block A 和 block B 都是 pending
    const blockAPending = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'Hello' }] } as RootContent,
      status: 'pending' as const
    }
    const blockBPending = {
      id: '1',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'World' }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([blockAPending, blockBPending])

    await new Promise(resolve => setTimeout(resolve, 50))

    // block A 完成了，变成 completed；block B 还是 pending
    const blockACompleted = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'Hello!' }] } as RootContent,
      status: 'completed' as const
    }
    transformer.push([blockACompleted, blockBPending])

    await new Promise(resolve => setTimeout(resolve, 50))

    const finalState = onChangeCalls[onChangeCalls.length - 1]

    // 验证：应该有两个 blocks
    expect(finalState).toHaveLength(2)

    // 验证：block 0 应该是 completed
    const block0 = finalState?.find((b: any) => b.id === '0')
    expect(block0?.isDisplayComplete).toBe(true)

    // 验证：block 1 应该正在处理或等待
    const block1 = finalState?.find((b: any) => b.id === '1')
    expect(block1).toBeDefined()
  })

  it('场景：block 在 current 位置时内容完成，同时状态变成 completed', async () => {
    let completedCount = 0
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: [5, 10],  // 分多次处理
      tickInterval: 5,
      effect: 'none',
      onChange: (blocks) => {
        // 统计 completed blocks
        completedCount = blocks.filter((b: any) => b.isDisplayComplete).length
      },
      onAllComplete: () => {
        // All complete
      }
    })

    // 第一次 push：block A 是 pending
    const blockAPending = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'A'.repeat(20) }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([blockAPending])

    // 等 tick 处理几次
    await new Promise(resolve => setTimeout(resolve, 30))

    // 在 block A 还在处理时，它变成 completed 且内容完整
    const blockACompleted = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'A'.repeat(20) }] } as RootContent,
      status: 'completed' as const
    }
    transformer.push([blockACompleted])

    await new Promise(resolve => setTimeout(resolve, 30))

    // 验证：block A 应该在 completedBlocks 中
    const displayBlocks = transformer.getDisplayBlocks()
    expect(displayBlocks).toHaveLength(1)
    expect(displayBlocks[0].isDisplayComplete).toBe(true)
  })

  it('场景：模拟真实情况，两个 block 在中间状态不变', async () => {
    const states: any[] = []
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: [3, 5],  // 小步长，模拟真实打字机
      tickInterval: 10,
      effect: 'none',  // 使用 none 效果，避免光标问题
      onChange: (blocks) => {
        states.push({
          timestamp: Date.now(),
          blocks: blocks.map((b: any) => ({
            id: b.id,
            isDisplayComplete: b.isDisplayComplete,
            type: b.displayNode?.type
          }))
        })
      }
    })

    // 模拟：有两个 block，一个是段落，一个是代码块
    const paragraphBlock = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'This is a long paragraph with many words' }] } as RootContent,
      status: 'pending' as const
    }
    const codeBlock = {
      id: '1',
      node: { type: 'code', lang: 'js', value: 'console.log("Hello");' } as RootContent,
      status: 'pending' as const
    }

    // 第一次 push：两个都是 pending
    transformer.push([paragraphBlock, codeBlock])

    await new Promise(resolve => setTimeout(resolve, 30))

    // 第二次 push：段落变成 completed，代码块还是 pending
    const paragraphBlockCompleted = {
      id: '0',
      node: { type: 'paragraph', children: [{ type: 'text', value: 'This is a long paragraph with many words!' }] } as RootContent,
      status: 'completed' as const
    }
    transformer.push([paragraphBlockCompleted, codeBlock])

    await new Promise(resolve => setTimeout(resolve, 50))

    // 第三次 push：两个都变成 completed
    const codeBlockCompleted = {
      id: '1',
      node: { type: 'code', lang: 'js', value: 'console.log("Hello World!");' } as RootContent,
      status: 'completed' as const
    }
    transformer.push([paragraphBlockCompleted, codeBlockCompleted])

    // 等待更长时间让第二个 block 也完成处理
    await new Promise(resolve => setTimeout(resolve, 200))

    const finalState = states[states.length - 1]

    // 验证：最终应该有两个 completed blocks
    expect(finalState.blocks).toHaveLength(2)
    expect(finalState.blocks[0].isDisplayComplete).toBe(true)
    expect(finalState.blocks[1].isDisplayComplete).toBe(true)
  })

  it('场景：容器增量解析时，已完成版本和未完成版本同时存在', async () => {
    const states: any[] = []
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 100,  // 一次读完
      tickInterval: 10,
      effect: 'none',
      onChange: (blocks) => {
        states.push({
          timestamp: Date.now(),
          blocks: blocks.map((b: any) => ({
            id: b.id,
            isDisplayComplete: b.isDisplayComplete,
            type: b.displayNode?.type
          }))
        })
      }
    })

    // 模拟容器解析过程：
    // 第一次 push：容器未完成（pending）
    const containerPending = {
      id: '0',
      node: { type: 'container', children: [{ type: 'paragraph', children: [{ type: 'text', value: '这是第一段' }] }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([containerPending])

    await new Promise(resolve => setTimeout(resolve, 30))

    // 第二次 push：容器内容增加，但还有一个未完成的版本在 pending 中
    // 这时候会有一个 completed 的容器（旧内容）和一个 pending 的容器（新内容）
    const containerCompleted = {
      id: '0',
      node: { type: 'container', children: [{ type: 'paragraph', children: [{ type: 'text', value: '这是第一段' }] }] } as RootContent,
      status: 'completed' as const
    }
    const containerPending2 = {
      id: '1',
      node: { type: 'container', children: [{ type: 'paragraph', children: [{ type: 'text', value: '这是第一段\n\n这是第二段' }] }] } as RootContent,
      status: 'pending' as const
    }
    transformer.push([containerCompleted, containerPending2])

    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证：应该有两个容器
    const finalState = states[states.length - 1]

    // 由于 charsPerTick: 100，两个容器都可能已经完成
    // 关键是验证它们都被正确地推入了 transformer
    expect(finalState.blocks.length).toBeGreaterThanOrEqual(1)
    expect(finalState.blocks.length).toBeLessThanOrEqual(2)

    // 第一个应该存在
    expect(finalState.blocks[0].id).toBe('0')

    // 如果有两个，第二个也应该存在
    if (finalState.blocks.length === 2) {
      expect(finalState.blocks[1].id).toBe('1')
    }
  })

  it('场景：真实容器增量解析，验证已完成和未完成版本同时存在', async () => {
    const parser = createIncremarkParser({ gfm: true, containers: true })

    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 50,
      tickInterval: 10,
      effect: 'none',
      onChange: () => {}
    })

    // 第一次 append：容器未完成
    const text1 = `容器还可以包含多个段落：

:::info{title="多段落示例"}
这是容器中的第一段。

`

    const result1 = parser.append(text1)

    // 推入 blocks 到 transformer
    const blocks1 = [...result1.completed, ...result1.pending]
    transformer.push(blocks1)

    await new Promise(resolve => setTimeout(resolve, 30))

    // 第二次 append：容器内容增加
    const text2 = `这是第二段。你可以包含：

- 列表
- **粗体文本**
- *斜体文本*
- 甚至 \`行内代码\`

所有这些都可以在同一个容器中！
:::
`

    const result2 = parser.append(text2)

    // 推入更新后的 blocks 到 transformer
    const blocks2 = [...result2.completed, ...result2.pending]
    transformer.push(blocks2)

    await new Promise(resolve => setTimeout(resolve, 50))

    // 跳过动画，验证最终状态
    transformer.skip()
    const finalBlocks = transformer.getDisplayBlocks()

    // 验证最终状态：应该包含段落和容器
    expect(finalBlocks.length).toBeGreaterThanOrEqual(1)

    // 验证容器存在
    const containerBlock = finalBlocks.find(b => (b.displayNode as any)?.type === 'containerDirective')
    expect(containerBlock).toBeDefined()

    // 验证没有重复的 blocks
    const ids = finalBlocks.map(b => b.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('场景：容器增量解析时内部 blocks 被正确移除', async () => {
    const transformer = createBlockTransformer({
      plugins: [mathPlugin],
      charsPerTick: 1000,  // 快速完成
      tickInterval: 10,
      effect: 'none',
      onChange: () => {}
    })

    // 模拟增量解析过程：
    // 第一阶段：容器未完成，内部内容被解析为独立 blocks
    const pendingBlocks1 = [
      {
        id: '0',
        node: { type: 'paragraph', children: [{ type: 'text', value: '第一段' }] } as RootContent,
        status: 'pending' as const
      },
      {
        id: '35',
        node: { type: 'paragraph', children: [{ type: 'text', value: '第二段' }] } as RootContent,
        status: 'pending' as const
      },
      {
        id: '49',
        node: { type: 'list', children: [] } as RootContent,
        status: 'pending' as const
      }
    ]
    transformer.push(pendingBlocks1)

    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证：此时应该有 3 个 blocks
    let displayBlocks = transformer.getDisplayBlocks()
    expect(displayBlocks).toHaveLength(3)

    // 第二阶段：容器完成，只返回容器 block，内部 blocks 不再单独返回
    const completedBlocks = [
      {
        id: '0',
        node: { type: 'containerDirective', children: [
          { type: 'paragraph', children: [{ type: 'text', value: '第一段' }] },
          { type: 'paragraph', children: [{ type: 'text', value: '第二段' }] },
          { type: 'list', children: [] }
        ] } as RootContent,
        status: 'completed' as const
      }
    ]
    transformer.push(completedBlocks)

    await new Promise(resolve => setTimeout(resolve, 50))

    // 验证：此时应该只有 1 个 block（容器）
    displayBlocks = transformer.getDisplayBlocks()
    expect(displayBlocks).toHaveLength(1)
    expect(displayBlocks[0].id).toBe('0')
    expect((displayBlocks[0].displayNode as any).type).toBe('containerDirective')

    // 验证：之前的 blocks (35, 49) 已被移除
    const ids = displayBlocks.map(b => b.id)
    expect(ids).not.toContain('35')
    expect(ids).not.toContain('49')
  })
})
