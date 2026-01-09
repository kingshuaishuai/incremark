/**
 * @file useBlockTransformer - 块转换器
 * @description 用于控制 blocks 的逐步显示（打字机效果），使用 Svelte 5 runes 语法
 */

import {
  createBlockTransformer,
  type TransformerOptions,
  type DisplayBlock,
  type SourceBlock,
  type AnimationEffect,
  type BlockTransformer
} from '@incremark/core'

/**
 * useBlockTransformer 选项
 */
export interface UseBlockTransformerOptions extends Omit<TransformerOptions, 'onChange'> {}

/**
 * useBlockTransformer 返回值
 */
export interface UseBlockTransformerReturn<T = unknown> {
  /** 用于渲染的 display blocks（getter） */
  readonly displayBlocks: DisplayBlock<T>[]
  /** 是否正在处理中（getter） */
  readonly isProcessing: boolean
  /** 是否已暂停（getter） */
  readonly isPaused: boolean
  /** 当前动画效果（getter） */
  readonly effect: AnimationEffect
  /** 推入新的 source blocks */
  push: (blocks: SourceBlock<T>[]) => void
  /** 跳过所有动画 */
  skip: () => void
  /** 重置状态 */
  reset: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<Pick<TransformerOptions, 'charsPerTick' | 'tickInterval' | 'effect' | 'pauseOnHidden'>>) => void
  /** transformer 实例（用于高级用法） */
  transformer: BlockTransformer<T>
}

/**
 * Svelte 5 Composable: Block Transformer
 *
 * @description
 * 用于控制 blocks 的逐步显示（打字机效果）
 * 作为解析器和渲染器之间的中间层，使用 Svelte 5 runes 语法
 *
 * 特性：
 * - 使用 requestAnimationFrame 实现流畅动画
 * - 支持随机步长 `charsPerTick: [1, 3]`
 * - 支持动画效果 `effect: 'typing'`
 * - 页面不可见时自动暂停
 *
 * @param options - 转换器选项
 * @returns 转换器状态和控制对象
 *
 * @example
 * ```svelte
 * <script>
 *   import { useIncremark, useBlockTransformer, defaultPlugins } from '@incremark/svelte'
 *
 *   const incremark = useIncremark()
 *
 *   // 添加打字机效果
 *   const blockTransformer = useBlockTransformer({
 *     charsPerTick: [1, 3],
 *     tickInterval: 30,
 *     effect: 'typing',
 *     plugins: defaultPlugins
 *   })
 *
 *   // 当 blocks 变化时推入
 *   $effect(() => {
 *     const sourceBlocks = incremark.completedBlocks.map(b => ({
 *       id: b.id,
 *       node: b.node,
 *       status: b.status
 *     }))
 *     blockTransformer.push(sourceBlocks)
 *   })
 * </script>
 *
 * <Incremark blocks={blockTransformer.displayBlocks} />
 * {#if blockTransformer.isProcessing}
 *   <button onclick={blockTransformer.skip}>跳过</button>
 * {/if}
 * ```
 */
export function useBlockTransformer<T = unknown>(
  options: UseBlockTransformerOptions = {}
): UseBlockTransformerReturn<T> {
  // 使用 $state runes
  let displayBlocksState = $state<DisplayBlock<T>[]>([])
  let isProcessingState = $state(false)
  let isPausedState = $state(false)
  let effectState = $state<AnimationEffect>(options.effect ?? 'none')

  const transformer = createBlockTransformer<T>({
    ...options,
    onChange: (blocks) => {
      displayBlocksState = blocks as DisplayBlock<T>[]
      isProcessingState = transformer.isProcessing()
      isPausedState = transformer.isPausedState()
    }
  })

  /**
   * 推入新的 source blocks
   */
  function push(blocks: SourceBlock<T>[]): void {
    transformer.push(blocks)

    // 处理正在显示的 block 内容更新
    const currentDisplaying = displayBlocksState.find((b) => !b.isDisplayComplete)
    if (currentDisplaying) {
      const updated = blocks.find((b) => b.id === currentDisplaying.id)
      if (updated) {
        transformer.update(updated)
      }
    }
  }

  return {
    get displayBlocks() { return displayBlocksState },
    get isProcessing() { return isProcessingState },
    get isPaused() { return isPausedState },
    get effect() { return effectState },
    push,
    skip: () => transformer.skip(),
    reset: () => transformer.reset(),
    pause: () => {
      transformer.pause()
      isPausedState = true
    },
    resume: () => {
      transformer.resume()
      isPausedState = false
    },
    setOptions: (opts) => {
      transformer.setOptions(opts)
      if (opts.effect !== undefined) {
        effectState = opts.effect
      }
    },
    transformer
  }
}
