import {
  createSignal,
  createComputed,
  createEffect,
  onCleanup,
  type Accessor,
  type Setter
} from 'solid-js'
import {
  createIncremarkParser,
  type IncremarkParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type TransformerPlugin,
  type AnimationEffect
} from '@incremark/core'
import { useProvideDefinations } from './useProvideDefinations'
import { useTypewriter } from './useTypewriter'
import { clearAnimatedChunks } from '../utils/animatedChunks'

/** 打字机效果配置 */
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

export interface UseIncremarkOptions extends IncremarkParserOptions {
  /** 打字机配置，传入即创建 transformer（可通过 enabled 控制是否启用） */
  typewriter?: TypewriterOptions
}

/** 打字机控制对象 */
export interface TypewriterControls {
  /** 是否启用（只读） */
  enabled: Accessor<boolean>
  /** 设置是否启用 */
  setEnabled: (enabled: boolean) => void
  /** 是否正在处理中 */
  isProcessing: Accessor<boolean>
  /** 是否已暂停 */
  isPaused: Accessor<boolean>
  /** 当前动画效果 */
  effect: Accessor<AnimationEffect>
  /** 跳过动画，直接显示全部 */
  skip: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<TypewriterOptions>) => void
}

/** useIncremark 的返回类型 */
export type UseIncremarkReturn = ReturnType<typeof useIncremark>

/**
 * SolidJS Hook: Incremark 流式 Markdown 解析器
 *
 * @example
 * ```tsx
 * import { useIncremark, Incremark } from '@incremark/solid'
 *
 * function App() {
 *   // 基础用法
 *   const { blocks, append, finalize } = useIncremark()
 *
 *   // 启用打字机效果
 *   const { blocks, append, finalize, typewriter } = useIncremark({
 *     typewriter: {
 *       enabled: true,       // 可响应式切换
 *       charsPerTick: [1, 3],
 *       tickInterval: 30,
 *       effect: 'typing',
 *       cursor: '|'
 *     }
 *   })
 *
 *   // 动态切换打字机效果
 *   typewriter.setEnabled(false)
 *
 *   return (
 *     <>
 *       <Incremark blocks={blocks} />
 *       <Show when={typewriter.isProcessing()}>
 *         <button onClick={typewriter.skip}>跳过</button>
 *       </Show>
 *     </>
 *   )
 * }
 * ```
 */
export function useIncremark(optionsInput: () => UseIncremarkOptions = () => ({})) {
  // 内部自动提供 definitions context
  const { setDefinations, setFootnoteDefinitions, footnoteReferenceOrder, setFootnoteReferenceOrder, contextValue, DefinationsProvider } = useProvideDefinations()

  // 创建解析器的工厂函数
  function createParser(options: UseIncremarkOptions) {
    return createIncremarkParser({
      ...options,
      onChange: (state) => {
        setDefinations(state.definitions)
        setFootnoteDefinitions(state.footnoteDefinitions)
        options.onChange?.(state)
      }
    })
  }

  // 解析器
  let parser = createParser(optionsInput())

  const [completedBlocks, setCompletedBlocks] = createSignal<ParsedBlock[]>([])
  const [pendingBlocks, setPendingBlocks] = createSignal<ParsedBlock[]>([])
  const [isLoading, setIsLoading] = createSignal(false)
  const [markdown, setMarkdown] = createSignal('')
  const [isFinalized, setIsFinalized] = createSignal(false)

  // 使用 useTypewriter composable 管理打字机效果
  // 传入响应式的 typewriter 配置，让 useTypewriter 内部监听变化
  const { blocks, typewriter, transformer, isAnimationComplete, displayedFootnoteReferenceOrder } = useTypewriter({
    typewriter: () => optionsInput().typewriter,
    completedBlocks,
    pendingBlocks
  })

  // 内容是否完全显示完成
  // 如果没有配置打字机或未启用打字机：解析完成即显示完成
  // 如果启用打字机：解析完成 + 动画完成
  const isDisplayComplete = () => {
    // 没有配置打字机，或者打字机未启用：只需判断是否 finalized
    if (!optionsInput().typewriter || !typewriter.enabled()) {
      return isFinalized()
    }
    // 启用了打字机：需要 finalize + 动画完成
    return isFinalized() && isAnimationComplete()
  }

  // AST
  const [ast, setAst] = createSignal<Root>({
    type: 'root',
    children: []
  })

  /**
   * 处理解析器更新结果（统一 append 和 finalize 的更新逻辑）
   */
  function handleUpdate(update: IncrementalUpdate, isFinalize: boolean = false): void {
    setMarkdown(parser.getBuffer())

    // 处理被更新的 blocks（需要移除的旧 blocks）
    if (update.updated.length > 0) {
      const idsToRemove = new Set(update.updated.map(b => b.id))
      setCompletedBlocks(prev => prev.filter(b => !idsToRemove.has(b.id)))
    }

    if (update.completed.length > 0) {
      setCompletedBlocks(prev => [...prev, ...update.completed])
    }
    setPendingBlocks(update.pending)

    if (isFinalize) {
      // 如果还有 pending blocks，则将它们添加到 completed blocks 中
      if (update.pending.length > 0) {
        setCompletedBlocks(prev => [...prev, ...update.pending])
        setPendingBlocks([])
      }
      setIsLoading(false)
      setIsFinalized(true)
    } else {
      setIsLoading(true)
    }

    // 更新脚注引用顺序（解析器的完整顺序）
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)
    // 注意：这里不再直接调用 setFootnoteReferenceOrder
    // 脚注显示顺序由下面的 createEffect 根据打字机状态来控制
  }

  function append(chunk: string): IncrementalUpdate {
    const update = parser.append(chunk)
    setAst(update.ast)
    handleUpdate(update, false)
    return update
  }

  function finalize(): IncrementalUpdate {
    const update = parser.finalize()
    handleUpdate(update, true)
    return update
  }

  function abort(): IncrementalUpdate {
    return finalize()
  }

  function reset(): void {
    parser.reset()
    setCompletedBlocks([])
    setPendingBlocks([])
    setMarkdown('')
    setIsLoading(false)
    setIsFinalized(false)
    setFootnoteReferenceOrder([])

    // 重置 transformer
    transformer?.reset()

    // 清空已动画的 chunk 记录，让新内容可以播放动画
    clearAnimatedChunks()
  }

  // 监听 parser 相关 options 变化，动态更新配置（排除 typewriter 配置）
  // 使用 JSON.stringify 比较，避免 deep watch 对新对象的误触发
  // 注意：astBuilder 是类，需要单独处理
  let lastOptionsStr = ''
  createEffect(() => {
    const opts = optionsInput()
    const { typewriter: _, astBuilder, ...parserOptions } = opts
    // astBuilder 用名称标识，因为它是类不能 JSON.stringify
    const optionsStr = JSON.stringify(parserOptions) + '|' + (astBuilder?.name ?? 'default')

    if (optionsStr !== lastOptionsStr) {
      lastOptionsStr = optionsStr
      // 使用 updateOptions 动态更新配置（包括引擎切换），不需要重建 parser
      const { typewriter: _, ...parserOptions } = opts
      parser.updateOptions(parserOptions)
      // 同步 Solid 状态
      setCompletedBlocks([])
      setPendingBlocks([])
      setMarkdown('')
      setIsLoading(false)
      setIsFinalized(false)
      setFootnoteReferenceOrder([])
      transformer?.reset()
    }
  })

  // 监听打字机的 displayedFootnoteReferenceOrder 变化，更新脚注显示
  // 这确保脚注只在引用所在的 block 动画完成后才显示
  createEffect(() => {
    const newOrder = displayedFootnoteReferenceOrder()
    setFootnoteReferenceOrder(newOrder)
  })

  function render(content: string): IncrementalUpdate {
    const update = parser.render(content)

    setMarkdown(parser.getBuffer())
    setCompletedBlocks(parser.getCompletedBlocks())
    setPendingBlocks([])
    setIsLoading(false)
    setIsFinalized(true)
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)
    // render 是一次性渲染，不经过打字机，直接设置脚注顺序
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)

    return update
  }

  const result = {
    /** 已收集的完整 Markdown 字符串 */
    markdown,
    /** 已完成的块列表 */
    completedBlocks,
    /** 待处理的块列表 */
    pendingBlocks,
    /** 当前完整的 AST */
    ast,
    /** 用于渲染的 blocks（根据打字机设置自动处理） */
    blocks,
    /** 是否正在加载 */
    isLoading,
    /** 是否已完成（finalize） */
    isFinalized,
    /**
     * 内容是否完全显示完成
     * - 无打字机：等于 isFinalized
     * - 有打字机：isFinalized + 动画播放完成
     * 适用于控制 footnote 等需要在内容完全显示后才出现的元素
     */
    isDisplayComplete,
    /** 脚注引用的出现顺序 */
    footnoteReferenceOrder,
    /** 追加内容 */
    append,
    /** 完成解析 */
    finalize,
    /** 强制中断 */
    abort,
    /** 重置解析器和打字机 */
    reset,
    /** 一次性渲染（reset + append + finalize） */
    render,
    /** 解析器实例 */
    parser,
    /** 打字机控制 */
    typewriter,
    /** Context value for DefinationsProvider */
    contextValue,
    /** DefinationsProvider component */
    DefinationsProvider
  }

  return result as any
}
