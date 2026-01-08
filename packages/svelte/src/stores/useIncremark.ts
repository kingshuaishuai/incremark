/**
 * @file useIncremark Store - 核心 Store
 * @description Svelte 5 Store: Incremark 流式 Markdown 解析器
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store'
import {
  createIncremarkParser,
  type IncremarkParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type TransformerPlugin,
  type AnimationEffect
} from '@incremark/core'
import { setDefinitionsContext } from '../context/definitionsContext'
import { useTypewriter } from './useTypewriter'

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
  /** 是否启用（只读） */
  enabled: Readable<boolean>
  /** 设置是否启用 */
  setEnabled: (enabled: boolean) => void
  /** 是否正在处理中 */
  isProcessing: Readable<boolean>
  /** 是否已暂停 */
  isPaused: Readable<boolean>
  /** 当前动画效果 */
  effect: Readable<AnimationEffect>
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
  /** 已收集的完整 Markdown 字符串 */
  markdown: Writable<string>
  /** 已完成的块列表 */
  completedBlocks: Writable<ParsedBlock[]>
  /** 待处理的块列表 */
  pendingBlocks: Writable<ParsedBlock[]>
  /** 当前完整的 AST */
  ast: Readable<Root>
  /** 用于渲染的 blocks（根据打字机设置自动处理） */
  blocks: Readable<Array<RenderableBlock>>
  /** 是否正在加载 */
  isLoading: Writable<boolean>
  /** 是否已完成（finalize） */
  isFinalized: Writable<boolean>
  /**
   * 内容是否完全显示完成
   * - 无打字机：等于 isFinalized
   * - 有打字机：isFinalized + 动画播放完成
   * 适用于控制 footnote 等需要在内容完全显示后才出现的元素
   */
  isDisplayComplete: Readable<boolean>
  /** 脚注引用的出现顺序 */
  footnoteReferenceOrder: Writable<string[]>
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
 * Svelte 5 Store: Incremark 流式 Markdown 解析器
 *
 * @description
 * 核心 store，管理解析器状态和操作
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
 *   const { blocks, append, finalize } = useIncremark()
 *
 *   // 启用打字机效果
 *   const { blocks, append, finalize, typewriter } = useIncremark({
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
 * <template>
 *   <Incremark blocks={$blocks} />
 * </template>
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

  // 状态 stores
  const completedBlocks = writable<ParsedBlock[]>([])
  const pendingBlocks = writable<ParsedBlock[]>([])
  const isLoading = writable(false)
  const markdown = writable('')
  const isFinalized = writable(false)
  const footnoteReferenceOrder = writable<string[]>([])

  /**
   * 处理解析器更新结果（统一 append 和 finalize 的更新逻辑）
   */
  function handleUpdate(update: IncrementalUpdate, isFinalize: boolean): void {
    markdown.set(parser.getBuffer())

    if (update.completed.length > 0) {
      completedBlocks.update((blocks) => [
        ...blocks,
        ...update.completed
      ])
    }
    pendingBlocks.set(update.pending)

    if (isFinalize) {
      isLoading.set(false)
      isFinalized.set(true)
    } else {
      isLoading.set(true)
    }

    // 更新脚注引用顺序
    footnoteReferenceOrder.set(update.footnoteReferenceOrder)
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)
  }

  // 使用 useTypewriter store 管理打字机效果
  const { blocks, typewriter, transformer, isAnimationComplete } = useTypewriter({
    typewriter: options.typewriter,
    completedBlocks,
    pendingBlocks
  })

  // 内容是否完全显示完成
  // 如果没有配置打字机或未启用打字机：解析完成即显示完成
  // 如果启用打字机：解析完成 + 动画完成
  const isDisplayComplete = derived(
    [isFinalized, isAnimationComplete, typewriter.enabled],
    ([$isFinalized, $isAnimationComplete, $typewriterEnabled]) => {
      // 没有配置打字机，或者打字机未启用：只需判断是否 finalized
      if (!options.typewriter || !$typewriterEnabled) {
        return $isFinalized
      }
      // 启用了打字机：需要 finalize + 动画完成
      return $isFinalized && $isAnimationComplete
    }
  )

  // AST
  const ast = derived(
    [completedBlocks, pendingBlocks],
    ([$completedBlocks, $pendingBlocks]) => ({
      type: 'root' as const,
      children: [
        ...$completedBlocks.map((b) => b.node),
        ...$pendingBlocks.map((b) => b.node)
      ]
    })
  )

  /**
   * 追加内容
   *
   * @param chunk - 要追加的 Markdown 文本块
   * @returns 增量更新结果
   */
  function append(chunk: string): IncrementalUpdate {
    const update = parser.append(chunk)
    handleUpdate(update, false)
    return update
  }

  /**
   * 完成解析
   *
   * @returns 增量更新结果
   */
  function finalize(): IncrementalUpdate {
    const update = parser.finalize()
    handleUpdate(update, true)
    return update
  }

  /**
   * 强制中断
   *
   * @returns 增量更新结果
   */
  function abort(): IncrementalUpdate {
    return finalize()
  }

  /**
   * 重置解析器和打字机
   */
  function reset(): void {
    parser.reset()
    completedBlocks.set([])
    pendingBlocks.set([])
    markdown.set('')
    isLoading.set(false)
    isFinalized.set(false)
    footnoteReferenceOrder.set([])

    // 重置 transformer
    transformer?.reset()
  }

  /**
   * 一次性渲染（reset + append + finalize）
   *
   * @param content - 完整的 Markdown 内容
   * @returns 增量更新结果
   */
  function render(content: string): IncrementalUpdate {
    const update = parser.render(content)

    markdown.set(parser.getBuffer())
    completedBlocks.set(parser.getCompletedBlocks())
    pendingBlocks.set([])
    isLoading.set(false)
    isFinalized.set(true)
    footnoteReferenceOrder.set(update.footnoteReferenceOrder)
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)

    return update
  }

  /**
   * 更新解析器配置（动态更新，不需要重建 parser 实例）
   *
   * 注意：更新配置后会自动重置状态
   *
   * @param newOptions - 部分配置选项（包括 astBuilder，可以动态切换引擎）
   */
  function updateOptions(newOptions: Partial<IncremarkParserOptions>): void {
    parser.updateOptions(newOptions)
    // 同步 Svelte 状态
    completedBlocks.set([])
    pendingBlocks.set([])
    markdown.set('')
    isLoading.set(false)
    isFinalized.set(false)
    footnoteReferenceOrder.set([])
    transformer?.reset()
  }

  return {
    markdown,
    completedBlocks,
    pendingBlocks,
    ast,
    blocks,
    isLoading,
    isFinalized,
    isDisplayComplete,
    footnoteReferenceOrder,
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

