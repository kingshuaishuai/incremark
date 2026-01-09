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
  mathPlugin,
  collectFootnoteReferences,
  type RootContent,
  type ParsedBlock,
  type DisplayBlock,
  type AnimationEffect,
  type BlockTransformer,
  type BlockStatus
} from '@incremark/core'
import type { TypewriterOptions, TypewriterControls, RenderableBlock } from './useIncremark'
import { addCursorToNode } from '../utils/cursor'

export interface UseTypewriterOptions {
  typewriter?: TypewriterOptions
  completedBlocks: ParsedBlock[]
  pendingBlocks: ParsedBlock[]
}

export interface UseTypewriterReturn {
  /** 用于渲染的 blocks（经过打字机处理或原始blocks） */
  blocks: Array<RenderableBlock>
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（队列为空且没有正在处理的 block） */
  isAnimationComplete: boolean
  /**
   * 脚注引用顺序（所有动画完成后才返回）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   * 动画进行中时返回空数组
   */
  displayedFootnoteReferenceOrder: string[]
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
  const completedBlocksCacheRef = useRef<Map<string, RenderableBlock>>(new Map())

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
      // 默认插件 + 数学公式插件（数学公式应该整体显示，不参与打字机逐字符效果）
      plugins: twOptions.plugins ?? [...defaultPlugins, mathPlugin],
      onChange: (blocks) => {
        // 直接更新 displayBlocks 状态
        setDisplayBlocks(blocks as DisplayBlock<RootContent>[])
        setIsTypewriterProcessing(transformerRef.current?.isProcessing() ?? false)
        setIsTypewriterPaused(transformerRef.current?.isPausedState() ?? false)
      },
      onAllComplete: () => {
        // 所有动画完成
        setIsAnimationComplete(true)
      }
    })
  }

  const transformer = transformerRef.current

  // 转换为 SourceBlock 格式（包含 completed 和 pending）
  const sourceBlocks = useMemo(
    () => [
      ...completedBlocks.map((block) => ({
        id: block.id,
        node: block.node,
        status: block.status as BlockStatus
      })),
      ...pendingBlocks.map((block) => ({
        id: block.id,
        node: block.node,
        status: block.status as BlockStatus
      }))
    ],
    [completedBlocks, pendingBlocks]
  )

  // 推送 blocks 到 transformer
  useEffect(() => {
    if (!transformer) return

    // 直接推送所有 blocks（包括 pending）
    transformer.push(sourceBlocks)

    setIsTypewriterProcessing(transformer.isProcessing())
    setIsTypewriterPaused(transformer.isPausedState())
  }, [sourceBlocks, transformer])

  // 最终用于渲染的 blocks
  const blocks = useMemo(() => {
    // 未启用打字机或没有 transformer：返回原始 blocks
    if (!typewriterEnabled || !transformer) {
      return [...completedBlocks, ...pendingBlocks]
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

      const block: RenderableBlock = {
        id: db.id,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as BlockStatus,
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

  /**
   * 脚注引用顺序（所有动画完成后才返回）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   */
  const displayedFootnoteReferenceOrder = useMemo(() => {
    // 未启用打字机：返回所有脚注引用（从原始 blocks 中提取）
    if (!typewriterEnabled || !transformer) {
      const references: string[] = []
      const seen = new Set<string>()
      for (const block of [...completedBlocks, ...pendingBlocks]) {
        const blockRefs = collectFootnoteReferences(block.node)
        for (const ref of blockRefs) {
          if (!seen.has(ref)) {
            seen.add(ref)
            references.push(ref)
          }
        }
      }
      return references
    }

    // 启用打字机：只有所有动画完成后才返回脚注引用
    // 如果还有动画在进行中，返回空数组
    if (!isAnimationComplete) {
      return []
    }

    // 所有动画完成，返回全部脚注引用
    const references: string[] = []
    const seen = new Set<string>()
    for (const db of displayBlocks) {
      const blockRefs = collectFootnoteReferences(db.displayNode)
      for (const ref of blockRefs) {
        if (!seen.has(ref)) {
          seen.add(ref)
          references.push(ref)
        }
      }
    }
    return references
  }, [typewriterEnabled, transformer, isAnimationComplete, completedBlocks, pendingBlocks, displayBlocks])

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
    isAnimationComplete,
    displayedFootnoteReferenceOrder
  }
}
