/**
 * @file useTypewriter Composable - 打字机效果管理
 *
 * @description
 * 管理打字机效果的状态和控制逻辑，从 useIncremark 中拆分出来以简化代码。
 *
 * @author Incremark Team
 * @license MIT
 */

import { ref, shallowRef, computed, watch, toValue, onUnmounted, type Ref, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  createBlockTransformer,
  defaultPlugins,
  type RootContent,
  type ParsedBlock,
  type DisplayBlock,
  type AnimationEffect,
  type BlockTransformer,
  type BlockStatus
} from '@incremark/core'
import type { TypewriterOptions, TypewriterControls } from './useIncremark'
import { addCursorToNode } from '../utils/cursor'

export interface UseTypewriterOptions {
  typewriter: MaybeRefOrGetter<TypewriterOptions | undefined>
  completedBlocks: Ref<ParsedBlock[]>
  pendingBlocks: Ref<ParsedBlock[]>
}

export interface UseTypewriterReturn {
  /** 用于渲染的 blocks（经过打字机处理或原始blocks） */
  blocks: ComputedRef<Array<ParsedBlock & { isLastPending?: boolean }>>
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（队列为空且没有正在处理的 block） */
  isAnimationComplete: Ref<boolean>
}

/**
 * useTypewriter Composable
 *
 * @description
 * 管理打字机效果的所有状态和逻辑。
 *
 * @param options - 打字机配置和数据
 * @returns 打字机状态和控制对象
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const { typewriter: typewriterInput, completedBlocks, pendingBlocks } = options

  // 获取初始配置
  const initialConfig = toValue(typewriterInput)

  // 打字机状态
  const typewriterEnabled = ref(initialConfig?.enabled ?? !!initialConfig)
  const displayBlocksRef = shallowRef<DisplayBlock<RootContent>[]>([])
  const isTypewriterProcessing = ref(false)
  const isTypewriterPaused = ref(false)
  const typewriterEffect = ref<AnimationEffect>(initialConfig?.effect ?? 'none')
  const typewriterCursor = ref(initialConfig?.cursor ?? '|')
  const isAnimationComplete = ref(true) // 初始为 true（没有动画时视为完成）

  // 创建 transformer（如果有 typewriter 配置）
  let transformer: BlockTransformer<RootContent> | null = null

  if (initialConfig) {
    transformer = createBlockTransformer<RootContent>({
      charsPerTick: initialConfig.charsPerTick ?? [1, 3],
      tickInterval: initialConfig.tickInterval ?? 30,
      effect: initialConfig.effect ?? 'none',
      pauseOnHidden: initialConfig.pauseOnHidden ?? true,
      plugins: initialConfig.plugins ?? defaultPlugins,
      onChange: (blocks) => {
        displayBlocksRef.value = blocks as DisplayBlock<RootContent>[]
        isTypewriterProcessing.value = transformer?.isProcessing() ?? false
        isTypewriterPaused.value = transformer?.isPausedState() ?? false
        // 有 blocks 正在处理时，动画未完成
        if (transformer?.isProcessing()) {
          isAnimationComplete.value = false
        }
      },
      onAllComplete: () => {
        // 所有动画完成
        isAnimationComplete.value = true
      }
    })
  }

  // 监听配置变化，更新 transformer
  watch(
    () => toValue(typewriterInput),
    (newConfig) => {
      if (!newConfig) return

      // 更新本地状态
      if (newConfig.enabled !== undefined) {
        typewriterEnabled.value = newConfig.enabled
      }
      if (newConfig.effect !== undefined) {
        typewriterEffect.value = newConfig.effect
      }
      if (newConfig.cursor !== undefined) {
        typewriterCursor.value = newConfig.cursor
      }

      // 更新 transformer 配置
      transformer?.setOptions({
        charsPerTick: newConfig.charsPerTick,
        tickInterval: newConfig.tickInterval,
        effect: newConfig.effect,
        pauseOnHidden: newConfig.pauseOnHidden
      })
    },
    { deep: true }
  )

  // 将 completedBlocks 转换为 SourceBlock 格式
  const sourceBlocks = computed(() => {
    return completedBlocks.value.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status as BlockStatus
    }))
  })

  // 监听 sourceBlocks 变化，推送给 transformer
  if (transformer) {
    watch(
      sourceBlocks,
      (blocks) => {
        transformer!.push(blocks)

        // 更新正在显示的 block
        const currentDisplaying = displayBlocksRef.value.find((b) => !b.isDisplayComplete)
        if (currentDisplaying) {
          const updated = blocks.find((b) => b.id === currentDisplaying.id)
          if (updated) {
            transformer!.update(updated)
          }
        }
      },
      { immediate: true, deep: true }
    )
  }

  // 原始 blocks（不经过打字机）
  const rawBlocks = computed(() => {
    return [...completedBlocks.value, ...pendingBlocks.value]
  })

  // 最终用于渲染的 blocks
  const blocks = computed(() => {
    // 未启用打字机或没有 transformer：返回原始 blocks
    if (!typewriterEnabled.value || !transformer) {
      return rawBlocks.value
    }

    // 启用打字机：使用 displayBlocks
    return displayBlocksRef.value.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocksRef.value.length - 1

      // typing 效果时添加光标
      let node = db.displayNode
      if (typewriterEffect.value === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, typewriterCursor.value)
      }

      return {
        id: db.id,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as BlockStatus,
        isLastPending,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      }
    })
  })

  // 打字机控制对象
  const typewriterControls: TypewriterControls = {
    enabled: computed(() => typewriterEnabled.value),
    setEnabled: (value: boolean) => {
      typewriterEnabled.value = value
    },
    isProcessing: computed(() => isTypewriterProcessing.value),
    isPaused: computed(() => isTypewriterPaused.value),
    effect: computed(() => typewriterEffect.value),
    skip: () => transformer?.skip(),
    pause: () => {
      transformer?.pause()
      isTypewriterPaused.value = true
    },
    resume: () => {
      transformer?.resume()
      isTypewriterPaused.value = false
    },
    setOptions: (opts) => {
      if (opts.enabled !== undefined) {
        typewriterEnabled.value = opts.enabled
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
        typewriterEffect.value = opts.effect
      }
      if (opts.cursor !== undefined) {
        typewriterCursor.value = opts.cursor
      }
    }
  }

  // 清理
  onUnmounted(() => {
    transformer?.destroy()
  })

  return {
    blocks,
    typewriter: typewriterControls,
    transformer,
    isAnimationComplete
  }
}
