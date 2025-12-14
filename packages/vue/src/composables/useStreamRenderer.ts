import { ref, computed, type Ref, type ComputedRef } from 'vue'
import type { ParsedBlock } from '@incremark/core'

export interface BlockWithStableId extends ParsedBlock {
  /** 稳定的渲染 ID（用于 Vue key） */
  stableId: string
}

export interface UseStreamRendererOptions {
  /** 已完成的块 */
  completedBlocks: Ref<ParsedBlock[]>
  /** 待处理的块 */
  pendingBlocks: Ref<ParsedBlock[]>
}

export interface UseStreamRendererReturn {
  /** 带稳定 ID 的已完成块 */
  stableCompletedBlocks: ComputedRef<BlockWithStableId[]>
  /** 带稳定 ID 的待处理块 */
  stablePendingBlocks: ComputedRef<BlockWithStableId[]>
  /** 所有带稳定 ID 的块 */
  allStableBlocks: ComputedRef<BlockWithStableId[]>
}

/**
 * Vue 3 Composable: 流式渲染辅助
 *
 * 为块分配稳定的渲染 ID，确保 Vue 的虚拟 DOM 复用
 */
export function useStreamRenderer(options: UseStreamRendererOptions): UseStreamRendererReturn {
  const { completedBlocks, pendingBlocks } = options

  const stableCompletedBlocks = computed<BlockWithStableId[]>(() =>
    completedBlocks.value.map((block) => ({
      ...block,
      stableId: block.id
    }))
  )

  const stablePendingBlocks = computed<BlockWithStableId[]>(() =>
    pendingBlocks.value.map((block, index) => ({
      ...block,
      stableId: `pending-${index}`
    }))
  )

  const allStableBlocks = computed(() => [...stableCompletedBlocks.value, ...stablePendingBlocks.value])

  return {
    stableCompletedBlocks,
    stablePendingBlocks,
    allStableBlocks
  }
}

