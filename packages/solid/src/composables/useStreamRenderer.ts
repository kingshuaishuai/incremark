import { createSignal, type Accessor } from 'solid-js'
import type { ParsedBlock } from '@incremark/core'

export interface UseStreamRendererOptions {
  /** 初始块列表 */
  initialBlocks?: ParsedBlock[]
}

export interface UseStreamRendererReturn {
  /** 块列表 */
  blocks: Accessor<ParsedBlock[]>
  /** 设置块列表 */
  setBlocks: (blocks: ParsedBlock[]) => void
  /** 添加块 */
  addBlocks: (blocks: ParsedBlock[]) => void
  /** 清空块列表 */
  clearBlocks: () => void
  /** 块数量 */
  blockCount: Accessor<number>
}

/**
 * SolidJS 流式渲染 Hook
 *
 * 用于管理流式渲染的块列表状态
 */
export function useStreamRenderer(options: UseStreamRendererOptions = {}): UseStreamRendererReturn {
  const [blocks, setBlocks] = createSignal<ParsedBlock[]>(options.initialBlocks ?? [])

  function addBlocks(newBlocks: ParsedBlock[]) {
    setBlocks(prev => [...prev, ...newBlocks])
  }

  function clearBlocks() {
    setBlocks([])
  }

  const blockCount = () => blocks().length

  return {
    blocks,
    setBlocks,
    addBlocks,
    clearBlocks,
    blockCount
  }
}
