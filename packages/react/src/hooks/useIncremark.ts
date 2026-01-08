import { useState, useCallback, useMemo, useRef } from 'react'
import {
  createIncremarkParser,
  type IncremarkParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type IncremarkParser,
  type TransformerPlugin,
  type AnimationEffect
} from '@incremark/core'
import { useProvideDefinitions, type DefinitionsContextValue } from '../contexts/DefinitionsContext'
import { useTypewriter } from './useTypewriter'

/** 打字机效果配置 */
export interface TypewriterOptions {
  /** 是否启用打字机效果（可动态切换） */
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

// 可渲染的块类型（带 isLastPending 字段用于打字机光标）
export type RenderableBlock = ParsedBlock & { isLastPending?: boolean }

/** 打字机控制对象 */
export interface TypewriterControls {
  /** 是否启用 */
  enabled: boolean
  /** 设置启用状态 */
  setEnabled: (enabled: boolean) => void
  /** 是否正在处理中 */
  isProcessing: boolean
  /** 是否已暂停 */
  isPaused: boolean
  /** 当前动画效果 */
  effect: AnimationEffect
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
 * React Hook: Incremark 流式 Markdown 解析器
 *
 * @example
 * ```tsx
 * import { useIncremark, Incremark } from '@incremark/react'
 *
 * function App() {
 *   // 基础用法
 *   const incremark = useIncremark()
 *
 *   // 启用打字机效果
 *   const incremarkWithTypewriter = useIncremark({
 *     typewriter: {
 *       enabled: true,       // 可动态切换
 *       charsPerTick: [1, 3],
 *       tickInterval: 30,
 *       effect: 'typing',
 *       cursor: '|'
 *     }
 *   })
 *
 *   // 动态切换打字机效果
 *   incremarkWithTypewriter.typewriter.setEnabled(false)
 *
 *   return <Incremark incremark={incremark} />
 * }
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}) {
  const parserRef = useRef<IncremarkParser | null>(null)

  // 内部自动提供 definitions context
  const { value: definitionsContextValue, setDefinitions, setFootnoteDefinitions, setFootnoteReferenceOrder } = useProvideDefinitions()
  /**
   * 暴露给 Incremark 组件的 context value（用于自动注入 DefinitionsContext）
   *
   * @internal
   */
  const _definitionsContextValue: DefinitionsContextValue = definitionsContextValue

  /**
   * 避免在绝大多数“没有引用/脚注定义”的流式文本场景下，
   * 每次 onChange 都 setDefinitions/setFootnoteDefinitions 导致全树额外 re-render。
   *
   * @remarks
   * 这里先做一个非常便宜的优化：当两者都为空且之前也为空时，跳过更新。
   */
  const lastDefinitionsEmptyRef = useRef<boolean>(true)
  const lastFootnoteDefinitionsEmptyRef = useRef<boolean>(true)

  // 懒初始化 parser
  if (!parserRef.current) {
    parserRef.current = createIncremarkParser({
      ...options,
      onChange: (state) => {
        // 更新 definitions context（仅在必要时）
        const definitionsIsEmpty = Object.keys(state.definitions).length === 0
        const footnoteDefinitionsIsEmpty = Object.keys(state.footnoteDefinitions).length === 0

        if (!(definitionsIsEmpty && lastDefinitionsEmptyRef.current)) {
          setDefinitions(state.definitions)
          lastDefinitionsEmptyRef.current = definitionsIsEmpty
        }
        if (!(footnoteDefinitionsIsEmpty && lastFootnoteDefinitionsEmptyRef.current)) {
          setFootnoteDefinitions(state.footnoteDefinitions)
          lastFootnoteDefinitionsEmptyRef.current = footnoteDefinitionsIsEmpty
        }

        // 调用用户提供的 onChange
        options.onChange?.(state)
      }
    })
  }

  const parser = parserRef.current

  const [markdown, setMarkdown] = useState('')
  const [completedBlocks, setCompletedBlocks] = useState<ParsedBlock[]>([])
  const [pendingBlocks, setPendingBlocks] = useState<ParsedBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)

  /**
   * 处理解析器更新结果（统一 append 和 finalize 的更新逻辑）
   */
  const handleUpdate = useCallback(
    (update: IncrementalUpdate, isFinalize: boolean): void => {
      setMarkdown(parser.getBuffer())

      if (update.completed.length > 0) {
        setCompletedBlocks((prev) => [...prev, ...update.completed])
      }
      setPendingBlocks(update.pending)

      if (isFinalize) {
        setIsLoading(false)
        setIsFinalized(true)
      } else {
        setIsLoading(true)
      }

      // 更新脚注引用顺序
      setFootnoteReferenceOrder(update.footnoteReferenceOrder)
    },
    [parser, setFootnoteReferenceOrder]
  )

  // 使用 useTypewriter hook 管理打字机效果
  const { blocks, typewriter, transformer, isAnimationComplete } = useTypewriter({
    typewriter: options.typewriter,
    completedBlocks,
    pendingBlocks
  })

  // 内容是否完全显示完成
  // 如果没有配置打字机或未启用打字机：解析完成即显示完成
  // 如果启用打字机：解析完成 + 动画完成
  const isDisplayComplete = useMemo(() => {
    // 没有配置打字机，或者打字机未启用：只需判断是否 finalized
    if (!options.typewriter || !typewriter.enabled) {
      return isFinalized
    }
    // 启用了打字机：需要 finalize + 动画完成
    return isFinalized && isAnimationComplete
  }, [options.typewriter, typewriter.enabled, isFinalized, isAnimationComplete])

  // 计算 AST
  const ast = useMemo<Root>(
    () => ({
      type: 'root',
      children: [...completedBlocks.map((b) => b.node), ...pendingBlocks.map((b) => b.node)]
    }),
    [completedBlocks, pendingBlocks]
  )

  const append = useCallback(
    (chunk: string): IncrementalUpdate => {
      const update = parser.append(chunk)
      handleUpdate(update, false)
      return update
    },
    [parser, handleUpdate]
  )

  const finalize = useCallback((): IncrementalUpdate => {
    const update = parser.finalize()
    handleUpdate(update, true)
    return update
  }, [parser, handleUpdate])

  const abort = useCallback((): IncrementalUpdate => {
    return finalize()
  }, [finalize])

  const reset = useCallback((): void => {
    parser.reset()
    setCompletedBlocks([])
    setPendingBlocks([])
    setMarkdown('')
    setIsLoading(false)
    setIsFinalized(false)
    setFootnoteReferenceOrder([])

    // 重置 transformer
    transformer?.reset()
  }, [parser, transformer, setFootnoteReferenceOrder])

  const render = useCallback(
    (content: string): IncrementalUpdate => {
      const update = parser.render(content)

      setMarkdown(parser.getBuffer())
      setCompletedBlocks(parser.getCompletedBlocks())
      setPendingBlocks([])
      setIsLoading(false)
      setIsFinalized(true)
      setFootnoteReferenceOrder(update.footnoteReferenceOrder)

      return update
    },
    [parser, setFootnoteReferenceOrder]
  )

  /**
   * 更新解析器配置（动态更新，不需要重建 parser 实例）
   *
   * 注意：更新配置后会自动重置状态
   *
   * @param newOptions 部分配置选项（包括 astBuilder，可以动态切换引擎）
   */
  const updateOptions = useCallback(
    (newOptions: Partial<IncremarkParserOptions>): void => {
      parser.updateOptions(newOptions)
      // parser.updateOptions 内部已经调用了 reset()，我们只需要同步 React 状态
      setCompletedBlocks([])
      setPendingBlocks([])
      setMarkdown('')
      setIsLoading(false)
      setIsFinalized(false)
      setFootnoteReferenceOrder([])
      transformer?.reset()
    },
    [parser, transformer, setFootnoteReferenceOrder]
  )

  return {
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
    /** 更新解析器配置（动态更新，不需要重建实例） */
    updateOptions,
    /** 解析器实例 */
    parser,
    /** 打字机控制 */
    typewriter,
    /** @internal 提供给 Incremark 组件使用的 context value */
    _definitionsContextValue
  }
}

export type UseIncremarkReturn = ReturnType<typeof useIncremark>
