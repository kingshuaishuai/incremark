/**
 * @file useTypewriter Composable - 打字机效果管理
 *
 * @description
 * 管理打字机效果的状态和控制逻辑。
 *
 * @author Incremark Team
 * @license MIT
 */

import {
  createSignal,
  createEffect,
  onCleanup,
  type Accessor
} from 'solid-js'
import { createStore, reconcile } from 'solid-js/store'
import {
  createBlockTransformer,
  defaultPlugins,
  mathPlugin,
  collectFootnoteReferences,
  type RootContent,
  type ParsedBlock,
  type DisplayBlock,
  type AnimationEffect,
  type BlockTransformer
} from '@incremark/core'
import type { TypewriterOptions, TypewriterControls } from './useIncremark'
import { addCursorToNode } from '../utils/cursor'

export interface UseTypewriterOptions {
  typewriter: () => TypewriterOptions | undefined
  completedBlocks: Accessor<ParsedBlock[]>
  pendingBlocks: Accessor<ParsedBlock[]>
}

/** 用于渲染的 block 类型 */
export type RenderBlock = ParsedBlock & { isLastPending?: boolean }

export interface UseTypewriterReturn {
  /** 用于渲染的 blocks（经过打字机处理或原始blocks） */
  blocks: RenderBlock[]
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（队列为空且没有正在处理的 block） */
  isAnimationComplete: Accessor<boolean>
  /**
   * 脚注引用顺序（所有动画完成后才返回）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   * 动画进行中时返回空数组
   */
  displayedFootnoteReferenceOrder: Accessor<string[]>
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
  const initialConfig = typewriterInput()

  // 打字机状态
  const [typewriterEnabled, setTypewriterEnabled] = createSignal(initialConfig?.enabled ?? !!initialConfig)
  const [isTypewriterProcessing, setIsTypewriterProcessing] = createSignal(false)
  const [isTypewriterPaused, setIsTypewriterPaused] = createSignal(false)
  const [typewriterEffect, setTypewriterEffect] = createSignal<AnimationEffect>(initialConfig?.effect ?? 'none')
  const [typewriterCursor, setTypewriterCursor] = createSignal(initialConfig?.cursor ?? '|')
  const [isAnimationComplete, setIsAnimationComplete] = createSignal(true) // 初始为 true（没有动画时视为完成）

  // 使用 store 来存储 blocks，利用 reconcile 进行细粒度更新
  // 这样只有真正变化的 block 才会触发重新渲染
  const [blocksStore, setBlocksStore] = createStore<{ items: RenderBlock[] }>({ items: [] })

  // 创建 transformer（如果有 typewriter 配置）
  let transformer: BlockTransformer<RootContent> | null = null

  // 用于存储 displayBlocks 的原始数据（用于脚注计算等）
  let displayBlocksCache: DisplayBlock<RootContent>[] = []

  /**
   * 将 DisplayBlock 转换为 RenderBlock
   * 抽取为函数以便复用
   */
  function convertToRenderBlocks(displayBlocks: DisplayBlock<RootContent>[]): RenderBlock[] {
    return displayBlocks.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocks.length - 1

      // typing 效果时添加光标
      let node = db.displayNode
      if (typewriterEffect() === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, typewriterCursor())
      }

      return {
        id: db.id,
        status: db.status,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: '',
        isLastPending
      }
    })
  }

  if (initialConfig) {
    transformer = createBlockTransformer<RootContent>({
      charsPerTick: initialConfig.charsPerTick ?? [1, 3],
      tickInterval: initialConfig.tickInterval ?? 30,
      effect: initialConfig.effect ?? 'none',
      pauseOnHidden: initialConfig.pauseOnHidden ?? true,
      // 默认插件 + 数学公式插件（数学公式应该整体显示，不参与打字机逐字符效果）
      plugins: initialConfig.plugins ?? [...defaultPlugins, mathPlugin],
      onChange: (blocks) => {
        displayBlocksCache = blocks as DisplayBlock<RootContent>[]
        // 使用 reconcile 进行细粒度更新，按 id 匹配
        // 这样只有真正变化的 block 才会触发重新渲染
        const newRenderBlocks = convertToRenderBlocks(displayBlocksCache)
        setBlocksStore('items', reconcile(newRenderBlocks, { key: 'id', merge: true }))
        setIsTypewriterProcessing(transformer?.isProcessing() ?? false)
        setIsTypewriterPaused(transformer?.isPausedState() ?? false)
        // 当还有 block 在处理中时，动画未完成
        if (transformer?.isProcessing() ?? false) {
          setIsAnimationComplete(false)
        }
      },
      onAllComplete: () => {
        // 所有动画完成
        setIsAnimationComplete(true)
      }
    })
  }

  // 监听配置变化，更新 transformer
  createEffect(() => {
    const newConfig = typewriterInput()
    if (!newConfig) return

    // 更新本地状态
    if (newConfig.enabled !== undefined) {
      setTypewriterEnabled(newConfig.enabled)
    }
    if (newConfig.effect !== undefined) {
      setTypewriterEffect(newConfig.effect)
    }
    if (newConfig.cursor !== undefined) {
      setTypewriterCursor(newConfig.cursor)
    }

    // 更新 transformer 配置
    transformer?.setOptions({
      charsPerTick: newConfig.charsPerTick,
      tickInterval: newConfig.tickInterval,
      effect: newConfig.effect,
      pauseOnHidden: newConfig.pauseOnHidden
    })

    // 当禁用打字机时，重置 transformer 状态，避免残留数据
    if (newConfig.enabled === false && transformer) {
      transformer.reset()
    }
  })

  // 监听 blocks 变化，推送给 transformer
  // transformer.push() 会自动检测并更新已存在 blocks 的内容变化
  // 只有当打字机启用时才推送给 transformer
  if (transformer) {
    createEffect(() => {
      // 只有启用打字机时才推送给 transformer
      if (!typewriterEnabled()) return

      // 直接传递原始 block 引用
      // ParsedBlock 的结构（id, node, status）已经兼容 SourceBlock
      const allBlocks = [...completedBlocks(), ...pendingBlocks()] as any
      transformer!.push(allBlocks)
    })
  }

  // 原始 blocks（不经过打字机）
  const rawBlocks = () => [...completedBlocks(), ...pendingBlocks()]

  // 监听非打字机模式下的 blocks 变化，同步到 store
  // 这个 effect 在以下情况触发：
  // 1. typewriterEnabled 从 true 变为 false
  // 2. completedBlocks 或 pendingBlocks 变化时（如果 typewriter 禁用）
  createEffect(() => {
    const enabled = typewriterEnabled()
    const blocks = rawBlocks() // 读取依赖

    if (!enabled || !transformer) {
      // 未启用打字机时，直接使用原始 blocks
      setBlocksStore('items', reconcile(blocks, { key: 'id', merge: true }))
    }
  })

  /**
   * 脚注引用顺序（所有动画完成后才返回）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   */
  const displayedFootnoteReferenceOrder = () => {
    // 未启用打字机：返回所有脚注引用（从原始 blocks 中提取）
    if (!typewriterEnabled() || !transformer) {
      const references: string[] = []
      const seen = new Set<string>()
      for (const block of rawBlocks()) {
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
    if (!isAnimationComplete()) {
      return []
    }

    // 所有动画完成，返回全部脚注引用（从 displayBlocksCache）
    const references: string[] = []
    const seen = new Set<string>()
    for (const db of displayBlocksCache) {
      const blockRefs = collectFootnoteReferences(db.displayNode)
      for (const ref of blockRefs) {
        if (!seen.has(ref)) {
          seen.add(ref)
          references.push(ref)
        }
      }
    }
    return references
  }

  // 打字机控制对象
  const typewriterControls: TypewriterControls = {
    enabled: () => typewriterEnabled(),
    setEnabled: (value: boolean) => {
      setTypewriterEnabled(value)
    },
    isProcessing: () => isTypewriterProcessing(),
    isPaused: () => isTypewriterPaused(),
    effect: () => typewriterEffect(),
    skip: () => transformer?.skip(),
    pause: () => {
      transformer?.pause()
      setIsTypewriterPaused(true)
    },
    resume: () => {
      transformer?.resume()
      setIsTypewriterPaused(false)
    },
    setOptions: (opts) => {
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
        setTypewriterCursor(opts.cursor)
      }
    }
  }

  // 清理
  onCleanup(() => {
    transformer?.destroy()
  })

  return {
    blocks: blocksStore.items,
    typewriter: typewriterControls,
    transformer,
    isAnimationComplete: () => isAnimationComplete(),
    displayedFootnoteReferenceOrder: () => displayedFootnoteReferenceOrder()
  }
}
