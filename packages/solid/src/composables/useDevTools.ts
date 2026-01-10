import { createSignal, type Accessor } from 'solid-js'
import type { ParsedBlock, Root } from '@incremark/core'

export interface UseDevToolsOptions {
  /** 是否启用开发者工具 */
  enabled?: boolean
}

export interface UseDevToolsReturn {
  /** 是否启用 */
  enabled: Accessor<boolean>
  /** 切换启用状态 */
  toggle: () => void
  /** 设置启用状态 */
  setEnabled: (value: boolean) => void
  /** 当前解析的块列表 */
  blocks: Accessor<ParsedBlock[]>
  /** 设置块列表 */
  setBlocks: (blocks: ParsedBlock[]) => void
  /** 当前 AST */
  ast: Accessor<Root | null>
  /** 设置 AST */
  setAst: (ast: Root) => void
  /** 统计信息 */
  stats: Accessor<{
    blockCount: number
    completedCount: number
    pendingCount: number
  }>
}

/**
 * SolidJS 开发者工具 Hook
 *
 * 用于调试 Incremark 解析器的内部状态
 */
export function useDevTools(options: UseDevToolsOptions = {}): UseDevToolsReturn {
  const [enabled, setEnabled] = createSignal(options.enabled ?? false)
  const [blocks, setBlocks] = createSignal<ParsedBlock[]>([])
  const [ast, setAst] = createSignal<Root | null>(null)

  const stats = () => ({
    blockCount: blocks().length,
    completedCount: blocks().filter(b => b.status === 'completed').length,
    pendingCount: blocks().filter(b => b.status !== 'completed').length
  })

  function toggle() {
    setEnabled(prev => !prev)
  }

  return {
    enabled,
    toggle,
    setEnabled,
    blocks,
    setBlocks,
    ast,
    setAst,
    stats
  }
}
