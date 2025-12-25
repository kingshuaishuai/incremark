/**
 * @file useTypewriter Hook - 打字机效果管理
 *
 * @description
 * 管理打字机效果的状态和控制逻辑，从 useIncremark 中拆分出来以简化代码。
 *
 * @author Incremark Team
 * @license MIT
 */

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import {
  createBlockTransformer,
  defaultPlugins,
  type RootContent,
  type ParsedBlock,
  type DisplayBlock,
  type AnimationEffect,
  type BlockTransformer
} from '@incremark/core'
import type { TypewriterOptions, TypewriterControls, BlockWithStableId } from './useIncremark'
import { addCursorToNode } from '../utils/cursor'

export interface UseTypewriterOptions {
  typewriter?: TypewriterOptions
  completedBlocks: ParsedBlock[]
  pendingBlocks: ParsedBlock[]
}

export interface UseTypewriterReturn {
  /** 用于渲染的 blocks（经过打字机处理或原始blocks） */
  blocks: BlockWithStableId[]
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（队列为空且没有正在处理的 block） */
  isAnimationComplete: boolean
}

/**
 * useTypewriter Hook
 *
 * @description
 * 管理打字机效果的所有状态和逻辑。
 *
 * @param options - 打字机配置和数据
 * @returns 打字机状态和控制对象
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const { typewriter: typewriterConfig, completedBlocks, pendingBlocks } = options

  // 打字机配置
  const hasTypewriterConfig = !!typewriterConfig
  const cursorRef = useRef(typewriterConfig?.cursor ?? '|')
  const transformerRef = useRef<BlockTransformer<RootContent> | null>(null)

  // 缓存已完成的 blocks，避免重新创建导致 fade-in 重新触发
  const completedBlocksCacheRef = useRef<Map<string, BlockWithStableId>>(new Map())

  // 打字机状态
  const [typewriterEnabled, setTypewriterEnabled] = useState(typewriterConfig?.enabled ?? hasTypewriterConfig)
  const [isTypewriterProcessing, setIsTypewriterProcessing] = useState(false)
  const [isTypewriterPaused, setIsTypewriterPaused] = useState(false)
  const [typewriterEffect, setTypewriterEffect] = useState<AnimationEffect>(
    typewriterConfig?.effect ?? 'none'
  )
  const [displayBlocks, setDisplayBlocks] = useState<DisplayBlock<RootContent>[]>([])
  const [isAnimationComplete, setIsAnimationComplete] = useState(true) // 初始为 true（没有动画时视为完成）

  // 懒初始化 transformer（如果有 typewriter 配置）
  if (hasTypewriterConfig && !transformerRef.current) {
    const twOptions = typewriterConfig!
    transformerRef.current = createBlockTransformer<RootContent>({
      charsPerTick: twOptions.charsPerTick ?? [1, 3],
      tickInterval: twOptions.tickInterval ?? 30,
      effect: twOptions.effect ?? 'none',
      pauseOnHidden: twOptions.pauseOnHidden ?? true,
      plugins: twOptions.plugins ?? defaultPlugins,
      onChange: (blocks) => {
        // 直接更新 displayBlocks 状态
        setDisplayBlocks(blocks as DisplayBlock<RootContent>[])
        setIsTypewriterProcessing(transformerRef.current?.isProcessing() ?? false)
        setIsTypewriterPaused(transformerRef.current?.isPausedState() ?? false)
        // 有 blocks 正在处理时，动画未完成
        if (transformerRef.current?.isProcessing()) {
          setIsAnimationComplete(false)
        }
      },
      onAllComplete: () => {
        // 所有动画完成
        setIsAnimationComplete(true)
      }
    })
  }

  const transformer = transformerRef.current

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

    // 启用打字机：使用 displayBlocks state
    return displayBlocks.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocks.length - 1

      // 如果是已完成的 block，尝试从缓存获取
      if (db.isDisplayComplete) {
        const cached = completedBlocksCacheRef.current.get(db.id)
        if (cached) {
          return cached
        }
      }

      // typing 效果时添加光标
      let node = db.displayNode
      if (typewriterEffect === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, cursorRef.current)
      }

      const block: BlockWithStableId = {
        id: db.id,
        stableId: db.id,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as 'pending' | 'stable' | 'completed',
        isLastPending,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      }

      // 如果是已完成的 block，缓存它
      if (db.isDisplayComplete) {
        completedBlocksCacheRef.current.set(db.id, block)
      }

      return block
    })
  }, [completedBlocks, pendingBlocks, typewriterEnabled, typewriterEffect, displayBlocks])

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
  const typewriterControls: TypewriterControls = useMemo(
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
    blocks,
    typewriter: typewriterControls,
    transformer,
    isAnimationComplete
  }
}
