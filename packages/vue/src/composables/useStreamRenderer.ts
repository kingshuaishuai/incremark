import { computed, type Ref, type ComputedRef } from 'vue'
import type { ParsedBlock } from '@incremark/core'

export interface UseStreamRendererOptions {
  /** 已完成的块 */
  completedBlocks: Ref<ParsedBlock[]>
  /** 待处理的块 */
  pendingBlocks: Ref<ParsedBlock[]>
}

export interface UseStreamRendererReturn {
  /** 已完成的块 */
  completedBlocks: ComputedRef<ParsedBlock[]>
  /** 待处理的块 */
  pendingBlocks: ComputedRef<ParsedBlock[]>
  /** 所有块 */
  allBlocks: ComputedRef<ParsedBlock[]>
}

/**
 * Vue 3 Composable: 流式渲染辅助
 *
 * 直接使用 block.id 作为稳定的渲染 key
 */
export function useStreamRenderer(options: UseStreamRendererOptions): UseStreamRendererReturn {
  const { completedBlocks, pendingBlocks } = options

  const completedBlocksComputed = computed<ParsedBlock[]>(() => completedBlocks.value)
  const pendingBlocksComputed = computed<ParsedBlock[]>(() => pendingBlocks.value)
  const allBlocks = computed(() => [...completedBlocksComputed.value, ...pendingBlocksComputed.value])

  return {
    completedBlocks: completedBlocksComputed,
    pendingBlocks: pendingBlocksComputed,
    allBlocks
  }
}

