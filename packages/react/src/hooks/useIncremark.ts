import { useState, useCallback, useMemo, useRef } from 'react'
import {
  createIncremarkParser,
  type ParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type IncremarkParser
} from '@incremark/core'

export interface UseIncremarkOptions extends ParserOptions {}

export interface BlockWithStableId extends ParsedBlock {
  stableId: string
}

/**
 * React Hook: Incremark 流式 Markdown 解析器
 *
 * @example
 * ```tsx
 * import { useIncremark } from '@incremark/react'
 *
 * function App() {
 *   const { markdown, blocks, append, finalize, reset } = useIncremark()
 *
 *   async function handleStream(stream) {
 *     for await (const chunk of stream) {
 *       append(chunk)
 *     }
 *     finalize()
 *   }
 *
 *   return <div>{markdown.length} 字符</div>
 * }
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}) {
  const parserRef = useRef<IncremarkParser | null>(null)

  // 懒初始化 parser
  if (!parserRef.current) {
    parserRef.current = createIncremarkParser(options)
  }

  const parser = parserRef.current

  const [markdown, setMarkdown] = useState('')
  const [completedBlocks, setCompletedBlocks] = useState<ParsedBlock[]>([])
  const [pendingBlocks, setPendingBlocks] = useState<ParsedBlock[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // 计算所有块（带稳定 ID）
  const blocks = useMemo<BlockWithStableId[]>(() => {
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
  }, [completedBlocks, pendingBlocks])

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
  }, [parser])

  /**
   * 一次性渲染完整 Markdown（reset + append + finalize）
   */
  const render = useCallback(
    (content: string): IncrementalUpdate => {
      // 调用 parser 的 render 方法
      const update = parser.render(content)

      // 同步状态
      setMarkdown(parser.getBuffer())
      setCompletedBlocks(parser.getCompletedBlocks())
      setPendingBlocks([])
      setIsLoading(false)

      return update
    },
    [parser]
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
    /** 所有块（完成 + 待处理），带稳定 ID */
    blocks,
    /** 是否正在加载 */
    isLoading,
    /** 追加内容 */
    append,
    /** 完成解析 */
    finalize,
    /** 强制中断 */
    abort,
    /** 重置解析器 */
    reset,
    /** 一次性渲染（reset + append + finalize） */
    render,
    /** 解析器实例 */
    parser
  }
}

export type UseIncremarkReturn = ReturnType<typeof useIncremark>

