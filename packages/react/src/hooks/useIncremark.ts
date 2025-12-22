import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  createIncremarkParser,
  createBlockTransformer,
  defaultPlugins,
  type ParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type RootContent,
  type IncremarkParser,
  type DisplayBlock,
  type TransformerPlugin,
  type AnimationEffect,
  type BlockTransformer
} from '@incremark/core'
import { useDefinitions } from '../contexts/DefinitionsContext'

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

export interface UseIncremarkOptions extends ParserOptions {
  /** 打字机配置，传入即创建 transformer（可通过 enabled 控制是否启用） */
  typewriter?: TypewriterOptions
}

export interface BlockWithStableId extends ParsedBlock {
  stableId: string
}

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
 *   const { blocks, append, finalize } = useIncremark()
 *
 *   // 启用打字机效果
 *   const { blocks, append, finalize, typewriter } = useIncremark({
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
 *   typewriter.setEnabled(false)
 *
 *   return (
 *     <>
 *       <Incremark blocks={blocks} />
 *       {typewriter.isProcessing && <button onClick={typewriter.skip}>跳过</button>}
 *     </>
 *   )
 * }
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}) {
  const parserRef = useRef<IncremarkParser | null>(null)
  const transformerRef = useRef<BlockTransformer<RootContent> | null>(null)
  
  // 获取 definitions context
  const { setDefinitions, setFootnoteDefinitions } = useDefinitions()

  // 打字机配置
  const hasTypewriterConfig = !!options.typewriter
  const cursorRef = useRef(options.typewriter?.cursor ?? '|')

  // 懒初始化 parser
  if (!parserRef.current) {
    parserRef.current = createIncremarkParser({
      ...options,
      onChange: (state) => {
        // 更新 definitions context
        setDefinitions(state.definitions)
        setFootnoteDefinitions(state.footnoteDefinitions)
        // 调用用户提供的 onChange
        options.onChange?.(state)
      }
    })
  }

  // 懒初始化 transformer（如果有 typewriter 配置）
  if (hasTypewriterConfig && !transformerRef.current) {
    const twOptions = options.typewriter!
    transformerRef.current = createBlockTransformer<RootContent>({
      charsPerTick: twOptions.charsPerTick ?? [1, 3],
      tickInterval: twOptions.tickInterval ?? 30,
      effect: twOptions.effect ?? 'none',
      pauseOnHidden: twOptions.pauseOnHidden ?? true,
      plugins: twOptions.plugins ?? defaultPlugins,
      onChange: () => {
        // 使用 forceUpdate 触发重渲染
        setForceUpdateCount((c) => c + 1)
      }
    })
  }

  const parser = parserRef.current
  const transformer = transformerRef.current

  const [markdown, setMarkdown] = useState('')
  const [completedBlocks, setCompletedBlocks] = useState<ParsedBlock[]>([])
  const [pendingBlocks, setPendingBlocks] = useState<ParsedBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFinalized, setIsFinalized] = useState(false)
  const [footnoteReferenceOrder, setFootnoteReferenceOrder] = useState<string[]>([])
  const [forceUpdateCount, setForceUpdateCount] = useState(0)

  // 打字机状态
  const [typewriterEnabled, setTypewriterEnabled] = useState(options.typewriter?.enabled ?? hasTypewriterConfig)
  const [isTypewriterProcessing, setIsTypewriterProcessing] = useState(false)
  const [isTypewriterPaused, setIsTypewriterPaused] = useState(false)
  const [typewriterEffect, setTypewriterEffect] = useState<AnimationEffect>(
    options.typewriter?.effect ?? 'none'
  )

  // 转换为 SourceBlock 格式
  const sourceBlocks = useMemo(
    () =>
      completedBlocks.map((block) => ({
        id: block.id,
        node: block.node,
        status: block.status as 'pending' | 'stable' | 'completed'
      })),
    [completedBlocks]
  )

  // 推送 blocks 到 transformer
  useEffect(() => {
    if (!transformer) return

    transformer.push(sourceBlocks)

    // 更新正在显示的 block
    const displayBlocks = transformer.getDisplayBlocks()
    const currentDisplaying = displayBlocks.find((b) => !b.isDisplayComplete)
    if (currentDisplaying) {
      const updated = sourceBlocks.find((b) => b.id === currentDisplaying.id)
      if (updated) {
        transformer.update(updated)
      }
    }

    setIsTypewriterProcessing(transformer.isProcessing())
    setIsTypewriterPaused(transformer.isPausedState())
  }, [sourceBlocks, transformer])

  // 在节点末尾添加光标
  const addCursorToNode = useCallback((node: RootContent, cursor: string): RootContent => {
    const cloned = JSON.parse(JSON.stringify(node))

    function addToLast(n: { children?: unknown[]; type?: string; value?: string }): boolean {
      if (n.children && n.children.length > 0) {
        for (let i = n.children.length - 1; i >= 0; i--) {
          if (addToLast(n.children[i] as { children?: unknown[]; type?: string; value?: string })) {
            return true
          }
        }
        n.children.push({ type: 'text', value: cursor })
        return true
      }
      if (n.type === 'text' && typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      if (typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      return false
    }

    addToLast(cloned)
    return cloned
  }, [])

  // 最终用于渲染的 blocks
  const blocks = useMemo<BlockWithStableId[]>(() => {
    // 未启用打字机或没有 transformer：返回原始 blocks
    if (!typewriterEnabled || !transformer) {
      const result: BlockWithStableId[] = []

      for (const block of completedBlocks) {
        result.push({ ...block, stableId: block.id })
      }

      for (let i = 0; i < pendingBlocks.length; i++) {
        result.push({
          ...pendingBlocks[i],
          stableId: `pending-${i}`
        })
      }

      return result
    }

    // 启用打字机：使用 displayBlocks
    const displayBlocks = transformer.getDisplayBlocks()

    return displayBlocks.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocks.length - 1

      // typing 效果时添加光标
      let node = db.displayNode
      if (typewriterEffect === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, cursorRef.current)
      }

      return {
        id: db.id,
        stableId: db.id,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as 'pending' | 'stable' | 'completed',
        isLastPending,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      } as BlockWithStableId
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedBlocks, pendingBlocks, typewriterEnabled, typewriterEffect, addCursorToNode, forceUpdateCount])

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
      setIsLoading(true)
      const update = parser.append(chunk)

      setMarkdown(parser.getBuffer())

      if (update.completed.length > 0) {
        setCompletedBlocks((prev) => [...prev, ...update.completed])
      }
      setPendingBlocks(update.pending)
      setFootnoteReferenceOrder(update.footnoteReferenceOrder)

      return update
    },
    [parser]
  )

  const finalize = useCallback((): IncrementalUpdate => {
    const update = parser.finalize()

    setMarkdown(parser.getBuffer())

    if (update.completed.length > 0) {
      setCompletedBlocks((prev) => [...prev, ...update.completed])
    }
    setPendingBlocks([])
    setIsLoading(false)
    setIsFinalized(true)
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)

    return update
  }, [parser])

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
  }, [parser, transformer])

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
    [parser]
  )

  // 打字机控制
  const skip = useCallback(() => {
    transformer?.skip()
    setIsTypewriterProcessing(false)
  }, [transformer])

  const pause = useCallback(() => {
    transformer?.pause()
    setIsTypewriterPaused(true)
  }, [transformer])

  const resume = useCallback(() => {
    transformer?.resume()
    setIsTypewriterPaused(false)
  }, [transformer])

  const setTypewriterOptions = useCallback(
    (opts: Partial<TypewriterOptions>) => {
      if (opts.enabled !== undefined) {
        setTypewriterEnabled(opts.enabled)
      }
      if (opts.charsPerTick !== undefined || opts.tickInterval !== undefined || opts.effect !== undefined || opts.pauseOnHidden !== undefined) {
        transformer?.setOptions({
          charsPerTick: opts.charsPerTick,
          tickInterval: opts.tickInterval,
          effect: opts.effect,
          pauseOnHidden: opts.pauseOnHidden
        })
      }
      if (opts.effect !== undefined) {
        setTypewriterEffect(opts.effect)
      }
      if (opts.cursor !== undefined) {
        cursorRef.current = opts.cursor
      }
    },
    [transformer]
  )

  // 打字机控制对象
  const typewriter: TypewriterControls = useMemo(
    () => ({
      enabled: typewriterEnabled,
      setEnabled: setTypewriterEnabled,
      isProcessing: isTypewriterProcessing,
      isPaused: isTypewriterPaused,
      effect: typewriterEffect,
      skip,
      pause,
      resume,
      setOptions: setTypewriterOptions
    }),
    [typewriterEnabled, isTypewriterProcessing, isTypewriterPaused, typewriterEffect, skip, pause, resume, setTypewriterOptions]
  )

  // 清理
  useEffect(() => {
    return () => {
      transformer?.destroy()
    }
  }, [transformer])

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
    typewriter
  }
}

export type UseIncremarkReturn = ReturnType<typeof useIncremark>
