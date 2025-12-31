/**
 * @file useTypewriter Store - 打字机效果管理
 * @description 管理打字机效果的状态和控制逻辑，从 useIncremark 中拆分出来以简化代码
 */

import { writable, derived, type Writable, type Readable } from 'svelte/store'
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

/**
 * useTypewriter 选项
 */
export interface UseTypewriterOptions {
  /** 打字机配置 */
  typewriter?: TypewriterOptions
  /** 已完成的块列表 store */
  completedBlocks: Writable<ParsedBlock[]>
  /** 待处理的块列表 store */
  pendingBlocks: Writable<ParsedBlock[]>
}

/**
 * useTypewriter 返回值
 */
export interface UseTypewriterReturn {
  /** 用于渲染的 blocks（经过打字机处理或原始blocks） */
  blocks: Readable<Array<ParsedBlock & { isLastPending?: boolean }>>
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（队列为空且没有正在处理的 block） */
  isAnimationComplete: Readable<boolean>
}

/**
 * useTypewriter Store
 *
 * @description
 * 管理打字机效果的所有状态和逻辑
 *
 * @param options - 打字机配置和数据
 * @returns 打字机状态和控制对象
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const { typewriter: typewriterConfig, completedBlocks, pendingBlocks } = options

  // 打字机状态 stores
  const typewriterEnabled = writable(typewriterConfig?.enabled ?? !!typewriterConfig)
  const displayBlocks = writable<DisplayBlock<RootContent>[]>([])
  const isTypewriterProcessing = writable(false)
  const isTypewriterPaused = writable(false)
  const typewriterEffect = writable<AnimationEffect>(typewriterConfig?.effect ?? 'none')
  const typewriterCursor = writable(typewriterConfig?.cursor ?? '|')
  const isAnimationComplete = writable(true) // 初始为 true（没有动画时视为完成）

  // 创建 transformer（如果有 typewriter 配置）
  let transformer: BlockTransformer<RootContent> | null = null

  if (typewriterConfig) {
    const twOptions = typewriterConfig
    transformer = createBlockTransformer<RootContent>({
      charsPerTick: twOptions.charsPerTick ?? [1, 3],
      tickInterval: twOptions.tickInterval ?? 30,
      effect: twOptions.effect ?? 'none',
      pauseOnHidden: twOptions.pauseOnHidden ?? true,
      plugins: twOptions.plugins ?? defaultPlugins,
      onChange: (blocks) => {
        displayBlocks.set(blocks as DisplayBlock<RootContent>[])
        isTypewriterProcessing.set(transformer?.isProcessing() ?? false)
        isTypewriterPaused.set(transformer?.isPausedState() ?? false)
        // 有 blocks 正在处理时，动画未完成
        if (transformer?.isProcessing()) {
          isAnimationComplete.set(false)
        }
      },
      onAllComplete: () => {
        // 所有动画完成
        isAnimationComplete.set(true)
      }
    })
  }

  // 将 completedBlocks 转换为 SourceBlock 格式
  const sourceBlocks = derived(
    completedBlocks,
    ($completedBlocks) => {
      return $completedBlocks.map(block => ({
        id: block.id,
        node: block.node,
        status: block.status as BlockStatus
      }))
    }
  )

  // 监听 sourceBlocks 变化，推送给 transformer
  if (transformer) {
    let unsubscribe: (() => void) | null = null
    
    unsubscribe = sourceBlocks.subscribe((blocks) => {
      transformer!.push(blocks)

      // 更新正在显示的 block
      displayBlocks.update((displayBlocksValue) => {
        const currentDisplaying = displayBlocksValue.find((b) => !b.isDisplayComplete)
        if (currentDisplaying) {
          const updated = blocks.find((b) => b.id === currentDisplaying.id)
          if (updated) {
            transformer!.update(updated)
          }
        }
        return displayBlocksValue
      })
    })
  }

  // 原始 blocks（不经过打字机）
  const rawBlocks = derived(
    [completedBlocks, pendingBlocks],
    ([$completedBlocks, $pendingBlocks]) => {
      const result: Array<ParsedBlock & { isLastPending?: boolean }> = []

      for (const block of $completedBlocks) {
        result.push(block)
      }

      for (let i = 0; i < $pendingBlocks.length; i++) {
        const isLastPending = i === $pendingBlocks.length - 1
        result.push({
          ...$pendingBlocks[i],
          isLastPending
        })
      }

      return result
    }
  )

  // 最终用于渲染的 blocks
  const blocks = derived(
    [typewriterEnabled, displayBlocks, rawBlocks, typewriterEffect, typewriterCursor],
    ([$enabled, $displayBlocks, $rawBlocks, $effect, $cursor]) => {
      // 未启用打字机或没有 transformer：返回原始 blocks
      if (!$enabled || !transformer) {
        return $rawBlocks
      }

      // 启用打字机：使用 displayBlocks
      return $displayBlocks.map((db, index) => {
        const isPending = !db.isDisplayComplete
        const isLastPending = isPending && index === $displayBlocks.length - 1

        // typing 效果时添加光标
        let node = db.displayNode
        if ($effect === 'typing' && isLastPending) {
          node = addCursorToNode(db.displayNode, $cursor)
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
    }
  )

  // 打字机控制对象
  const typewriterControls: TypewriterControls = {
    enabled: derived(typewriterEnabled, ($enabled) => $enabled),
    setEnabled: (value: boolean) => {
      typewriterEnabled.set(value)
    },
    isProcessing: derived(isTypewriterProcessing, ($processing) => $processing),
    isPaused: derived(isTypewriterPaused, ($paused) => $paused),
    effect: derived(typewriterEffect, ($effect) => $effect),
    skip: () => transformer?.skip(),
    pause: () => {
      transformer?.pause()
      isTypewriterPaused.set(true)
    },
    resume: () => {
      transformer?.resume()
      isTypewriterPaused.set(false)
    },
    setOptions: (opts) => {
      if (opts.enabled !== undefined) {
        typewriterEnabled.set(opts.enabled)
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
        typewriterEffect.set(opts.effect)
      }
      if (opts.cursor !== undefined) {
        typewriterCursor.set(opts.cursor)
      }
    }
  }

  return {
    blocks,
    typewriter: typewriterControls,
    transformer,
    isAnimationComplete: derived(isAnimationComplete, ($v) => $v)
  }
}

