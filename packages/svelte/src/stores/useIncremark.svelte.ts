/**
 * @file useIncremark - 核心 Composable
 * @description Svelte 5 Composable: Incremark 流式 Markdown 解析器（使用 runes 语法）
 */

import {
  createIncremarkParser,
  type IncremarkParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type TransformerPlugin,
  type AnimationEffect
} from '@incremark/core'
import { setDefinitionsContext } from '../context/definitionsContext.svelte.ts'
import { useTypewriter } from './useTypewriter.svelte.ts'

/**
 * 打字机效果配置
 */
export interface TypewriterOptions {
  /** 是否启用打字机效果（可响应式切换） */
  enabled?: boolean
  /** 每次显示的字符数，可以是固定值或范围 [min, max] */
  charsPerTick?: number | [number, number]
  /** 更新间隔 (ms) */
  tickInterval?: number
  /** 动画效果: 'none' | 'fade-in' | 'typing' */
  effect?: AnimationEffect
  /** 光标字符（仅 typing 效果使用） */
  cursor?: string
  /** 页面不可见时暂停 */
  pauseOnHidden?: boolean
  /** 自定义插件 */
  plugins?: TransformerPlugin[]
}

/**
 * useIncremark 选项
 */
export interface UseIncremarkOptions extends IncremarkParserOptions {
  /** 打字机配置，传入即创建 transformer（可通过 enabled 控制是否启用） */
  typewriter?: TypewriterOptions
}

// 可渲染的块类型（带 isLastPending 字段用于打字机光标）
export type RenderableBlock = ParsedBlock & { isLastPending?: boolean }

/**
 * 打字机控制对象
 */
export interface TypewriterControls {
  /** 是否启用（只读 getter） */
  readonly enabled: boolean
  /** 设置是否启用 */
  setEnabled: (enabled: boolean) => void
  /** 是否正在处理中 */
  readonly isProcessing: boolean
  /** 是否已暂停 */
  readonly isPaused: boolean
  /** 当前动画效果 */
  readonly effect: AnimationEffect
  /** 跳过动画，直接显示全部 */
  skip: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<TypewriterOptions>) => void
}

/**
 * useIncremark 返回值
 */
export interface UseIncremarkReturn {
  /** 已收集的完整 Markdown 字符串（getter） */
  readonly markdown: string
  /** 已完成的块列表（getter） */
  readonly completedBlocks: ParsedBlock[]
  /** 待处理的块列表（getter） */
  readonly pendingBlocks: ParsedBlock[]
  /** 当前完整的 AST（getter） */
  readonly ast: Root
  /** 用于渲染的 blocks（getter，根据打字机设置自动处理） */
  readonly blocks: Array<RenderableBlock>
  /** 是否正在加载（getter） */
  readonly isLoading: boolean
  /** 是否已完成（finalize）（getter） */
  readonly isFinalized: boolean
  /**
   * 内容是否完全显示完成（getter）
   * - 无打字机：等于 isFinalized
   * - 有打字机：isFinalized + 动画播放完成
   * 适用于控制 footnote 等需要在内容完全显示后才出现的元素
   */
  readonly isDisplayComplete: boolean
  /** 脚注引用的出现顺序（getter） */
  readonly footnoteReferenceOrder: string[]
  /** 追加内容 */
  append: (chunk: string) => IncrementalUpdate
  /** 完成解析 */
  finalize: () => IncrementalUpdate
  /** 强制中断 */
  abort: () => IncrementalUpdate
  /** 重置解析器和打字机 */
  reset: () => void
  /** 一次性渲染（reset + append + finalize） */
  render: (content: string) => IncrementalUpdate
  /** 更新解析器配置（动态更新，不需要重建 parser 实例） */
  updateOptions: (options: Partial<IncremarkParserOptions>) => void
  /** 解析器实例 */
  parser: ReturnType<typeof createIncremarkParser>
  /** 打字机控制 */
  typewriter: TypewriterControls
}

/**
 * Svelte 5 Composable: Incremark 流式 Markdown 解析器
 *
 * @description
 * 核心 composable，管理解析器状态和操作，使用 Svelte 5 runes 语法
 *
 * @param options - 解析器选项
 * @returns 解析器状态和控制对象
 *
 * @example
 * ```svelte
 * <script>
 *   import { useIncremark, Incremark } from '@incremark/svelte'
 *
 *   // 基础用法
 *   const incremark = useIncremark()
 *
 *   // 启用打字机效果
 *   const incremark = useIncremark({
 *     typewriter: {
 *       enabled: true,
 *       charsPerTick: [1, 3],
 *       tickInterval: 30,
 *       effect: 'typing',
 *       cursor: '|'
 *     }
 *   })
 * </script>
 *
 * <Incremark blocks={incremark.blocks} />
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}): UseIncremarkReturn {
  // 内部自动提供 definitions context
  const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = setDefinitionsContext()

  // 解析器
  const parser = createIncremarkParser({
    ...options,
    onChange: (state) => {
      setDefinations(state.definitions)
      setFootnoteDefinitions(state.footnoteDefinitions)
      // 调用用户提供的 onChange
      options.onChange?.(state)
    }
  })

  // 状态（使用 $state runes）
  let completedBlocksState = $state<ParsedBlock[]>([])
  let pendingBlocksState = $state<ParsedBlock[]>([])
  let isLoadingState = $state(false)
  let markdownState = $state('')
  let isFinalizedState = $state(false)
  let footnoteReferenceOrderState = $state<string[]>([])
  let astState = $state<Root>({
    type: 'root',
    children: []
  })

  /**
   * 处理解析器更新结果（统一 append 和 finalize 的更新逻辑）
   */
  function handleUpdate(update: IncrementalUpdate, isFinalize: boolean): void {
    markdownState = parser.getBuffer()

    // 处理被更新的 blocks（需要移除的旧 blocks）
    if (update.updated.length > 0) {
      const idsToRemove = new Set(update.updated.map((b) => b.id))
      completedBlocksState = completedBlocksState.filter((b) => !idsToRemove.has(b.id))
    }

    if (update.completed.length > 0) {
      completedBlocksState = [...completedBlocksState, ...update.completed]
    }
    pendingBlocksState = update.pending

    if (isFinalize) {
      // 如果还有 pending blocks，则将它们添加到 completed blocks 中
      if (update.pending.length > 0) {
        completedBlocksState = [...completedBlocksState, ...update.pending]
        pendingBlocksState = []
      }
      isLoadingState = false
      isFinalizedState = true
    } else {
      isLoadingState = true
    }

    // 更新脚注引用顺序（解析器的完整顺序）
    footnoteReferenceOrderState = update.footnoteReferenceOrder
  }

  // 使用 useTypewriter composable 管理打字机效果
  const typewriterResult = useTypewriter({
    typewriter: options.typewriter,
    getCompletedBlocks: () => completedBlocksState,
    getPendingBlocks: () => pendingBlocksState
  })
  
  const { getBlocks: getTypewriterBlocks, typewriter, transformer } = typewriterResult

  // 派生状态：用于渲染的 blocks
  const blocksGetter = $derived.by(() => {
    // 如果没有启用打字机，直接返回原始 blocks
    if (!options.typewriter || !typewriter.enabled) {
      return [
        ...completedBlocksState,
        ...pendingBlocksState.map((b, i) => ({
          ...b,
          isLastPending: i === pendingBlocksState.length - 1
        }))
      ]
    }
    // 否则返回打字机处理的 blocks
    return getTypewriterBlocks()
  })

  // 派生状态：内容是否完全显示完成
  const isDisplayCompleteGetter = $derived.by(() => {
    // 没有配置打字机，或者打字机未启用：只需判断是否 finalized
    if (!options.typewriter || !typewriter.enabled) {
      return isFinalizedState
    }
    // 启用了打字机：需要 finalize + 动画完成
    return isFinalizedState && typewriterResult.isAnimationComplete
  })

  // 派生状态：脚注引用顺序
  // 与 Vue 版本对齐：确保脚注只在引用所在的 block 动画完成后才显示
  const displayedFootnoteOrder = $derived.by(() => {
    // 没有配置打字机，或者打字机未启用：使用解析器的顺序
    if (!options.typewriter || !typewriter.enabled) {
      return footnoteReferenceOrderState
    }
    // 启用了打字机：从打字机获取脚注顺序（通过 getter 访问派生状态）
    // 注意：动画进行中时会返回空数组，这是正确的行为（隐藏脚注）
    return typewriterResult.displayedFootnoteReferenceOrder
  })

  // 监听脚注顺序变化，更新 context
  $effect(() => {
    setFootnoteReferenceOrder(displayedFootnoteOrder)
  })

  /**
   * 追加内容
   */
  function append(chunk: string): IncrementalUpdate {
    const update = parser.append(chunk)
    astState = update.ast
    handleUpdate(update, false)
    return update
  }

  /**
   * 完成解析
   */
  function finalize(): IncrementalUpdate {
    const update = parser.finalize()
    handleUpdate(update, true)
    return update
  }

  /**
   * 强制中断
   */
  function abort(): IncrementalUpdate {
    return finalize()
  }

  /**
   * 重置解析器和打字机
   */
  function reset(): void {
    parser.reset()
    completedBlocksState = []
    pendingBlocksState = []
    markdownState = ''
    isLoadingState = false
    isFinalizedState = false
    footnoteReferenceOrderState = []
    astState = { type: 'root', children: [] }

    // 重置 transformer
    transformer?.reset()
  }

  /**
   * 一次性渲染（reset + append + finalize）
   */
  function render(content: string): IncrementalUpdate {
    const update = parser.render(content)

    markdownState = parser.getBuffer()
    completedBlocksState = parser.getCompletedBlocks()
    pendingBlocksState = []
    isLoadingState = false
    isFinalizedState = true
    // render 是一次性渲染，不经过打字机，直接设置脚注顺序
    footnoteReferenceOrderState = update.footnoteReferenceOrder
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)

    return update
  }

  /**
   * 更新解析器配置（动态更新，不需要重建 parser 实例）
   */
  function updateOptions(newOptions: Partial<IncremarkParserOptions>): void {
    parser.updateOptions(newOptions)
    // 同步状态
    completedBlocksState = []
    pendingBlocksState = []
    markdownState = ''
    isLoadingState = false
    isFinalizedState = false
    footnoteReferenceOrderState = []
    astState = { type: 'root', children: [] }
    transformer?.reset()
  }

  return {
    get markdown() { return markdownState },
    get completedBlocks() { return completedBlocksState },
    get pendingBlocks() { return pendingBlocksState },
    get ast() { return astState },
    get blocks() { return blocksGetter },
    get isLoading() { return isLoadingState },
    get isFinalized() { return isFinalizedState },
    get isDisplayComplete() { return isDisplayCompleteGetter },
    get footnoteReferenceOrder() { return footnoteReferenceOrderState },
    append,
    finalize,
    abort,
    reset,
    render,
    updateOptions,
    parser,
    typewriter
  }
}
