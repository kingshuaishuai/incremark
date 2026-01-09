/**
 * @file useTypewriter Composable - 打字机效果管理
 * @description 管理打字机效果的状态和控制逻辑，使用 Svelte 5 runes
 */

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
import type { TypewriterOptions, TypewriterControls } from './useIncremark.svelte.ts'
import { addCursorToNode } from '../utils/cursor'

/**
 * useTypewriter 选项
 */
export interface UseTypewriterOptions {
  /** 打字机配置 */
  typewriter?: TypewriterOptions
  /** 获取已完成的块列表（使用 getter 函数实现响应式） */
  getCompletedBlocks: () => ParsedBlock[]
  /** 获取待处理的块列表（使用 getter 函数实现响应式） */
  getPendingBlocks: () => ParsedBlock[]
}

/**
 * useTypewriter 返回值
 */
export interface UseTypewriterReturn {
  /** 获取用于渲染的 blocks（经过打字机处理或原始blocks） */
  getBlocks: () => Array<ParsedBlock & { isLastPending?: boolean }>
  /** 打字机控制对象 */
  typewriter: TypewriterControls
  /** transformer 实例 */
  transformer: BlockTransformer<RootContent> | null
  /** 所有动画是否已完成（getter） */
  readonly isAnimationComplete: boolean
  /**
   * 脚注引用顺序（所有动画完成后才返回）（getter）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   * 动画进行中时返回空数组
   */
  readonly displayedFootnoteReferenceOrder: string[]
}

/**
 * useTypewriter Composable
 *
 * @description
 * 管理打字机效果的所有状态和逻辑，使用 Svelte 5 runes
 *
 * @param options - 打字机配置和数据
 * @returns 打字机状态和控制对象
 */
export function useTypewriter(options: UseTypewriterOptions): UseTypewriterReturn {
  const { typewriter: typewriterConfig, getCompletedBlocks, getPendingBlocks } = options

  // 打字机状态（使用 $state runes）
  let typewriterEnabled = $state(typewriterConfig?.enabled ?? !!typewriterConfig)
  let displayBlocks = $state<DisplayBlock<RootContent>[]>([])
  let isTypewriterProcessing = $state(false)
  let isTypewriterPaused = $state(false)
  let typewriterEffect = $state<AnimationEffect>(typewriterConfig?.effect ?? 'none')
  let typewriterCursor = $state(typewriterConfig?.cursor ?? '|')
  let isAnimationComplete = $state(true) // 初始为 true（没有动画时视为完成）

  // 创建 transformer（如果有 typewriter 配置）
  // 在初始化时立即创建，而不是延迟创建
  let transformer: BlockTransformer<RootContent> | null = null

  if (typewriterConfig) {
    transformer = createBlockTransformer<RootContent>({
      charsPerTick: typewriterConfig.charsPerTick ?? [1, 3],
      tickInterval: typewriterConfig.tickInterval ?? 30,
      effect: typewriterConfig.effect ?? 'none',
      pauseOnHidden: typewriterConfig.pauseOnHidden ?? true,
      // 默认插件 + 数学公式插件（数学公式应该整体显示，不参与打字机逐字符效果）
      plugins: typewriterConfig.plugins ?? [...defaultPlugins, mathPlugin],
      onChange: (blocks) => {
        displayBlocks = blocks as DisplayBlock<RootContent>[]
        isTypewriterProcessing = transformer?.isProcessing() ?? false
        isTypewriterPaused = transformer?.isPausedState() ?? false
      },
      onAllComplete: () => {
        // 所有动画完成
        isAnimationComplete = true
      }
    })
  }

  // 监听配置变化（同步 Vue 的 watch 逻辑）
  $effect(() => {
    const config = typewriterConfig
    if (!config || !transformer) return

    // 更新本地状态
    if (config.enabled !== undefined) {
      typewriterEnabled = config.enabled
    }
    if (config.effect !== undefined) {
      typewriterEffect = config.effect
    }
    if (config.cursor !== undefined) {
      typewriterCursor = config.cursor
    }

    // 更新 transformer 配置
    transformer.setOptions({
      charsPerTick: config.charsPerTick,
      tickInterval: config.tickInterval,
      effect: config.effect,
      pauseOnHidden: config.pauseOnHidden
    })
  })

  // 监听 blocks 变化，推送给 transformer
  // transformer.push() 会自动检测并更新已存在 blocks 的内容变化
  $effect(() => {
    // 只有在 transformer 存在时才推送 blocks
    if (!transformer) return

    // 通过 getter 函数获取最新的 blocks（这样可以跟踪响应式变化）
    const completedBlocks = getCompletedBlocks()
    const pendingBlocks = getPendingBlocks()

    // 直接传递原始 block 引用
    // ParsedBlock 的结构（id, node, status）已经兼容 SourceBlock
    const allBlocks = [...completedBlocks, ...pendingBlocks] as any
    transformer.push(allBlocks)
  })

  // 获取原始 blocks（不经过打字机）
  function getRawBlocks(): Array<ParsedBlock & { isLastPending?: boolean }> {
    const completedBlocks = getCompletedBlocks()
    const pendingBlocks = getPendingBlocks()
    const result: Array<ParsedBlock & { isLastPending?: boolean }> = []

    for (const block of completedBlocks) {
      result.push(block)
    }

    for (let i = 0; i < pendingBlocks.length; i++) {
      const isLastPending = i === pendingBlocks.length - 1
      result.push({
        ...pendingBlocks[i],
        isLastPending
      })
    }

    return result
  }

  // 获取最终用于渲染的 blocks
  function getBlocks(): Array<ParsedBlock & { isLastPending?: boolean }> {
    // 未启用打字机或没有 transformer：返回原始 blocks
    if (!typewriterEnabled || !transformer) {
      return getRawBlocks()
    }

    // 启用打字机：使用 displayBlocks state
    return displayBlocks.map((db, index) => {
      const isPending = !db.isDisplayComplete
      const isLastPending = isPending && index === displayBlocks.length - 1

      // typing 效果时添加光标
      let node = db.displayNode
      if (typewriterEffect === 'typing' && isLastPending) {
        node = addCursorToNode(db.displayNode, typewriterCursor)
      }

      return {
        id: db.id,
        status: db.status,
        isLastPending,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      }
    })
  }

  /**
   * 派生状态：脚注引用顺序（所有动画完成后才返回）
   * 用于控制脚注的显示时机：只有当所有 blocks 的打字机动画都完成后才显示脚注
   */
  const displayedFootnoteReferenceOrder = $derived.by(() => {
    // 未启用打字机：返回所有脚注引用（从原始 blocks 中提取）
    if (!typewriterEnabled || !transformer) {
      const references: string[] = []
      const seen = new Set<string>()
      for (const block of getRawBlocks()) {
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
  })

  // 打字机控制对象
  const typewriterControls: TypewriterControls = {
    get enabled() { return typewriterEnabled },
    setEnabled: (value: boolean) => {
      typewriterEnabled = value
    },
    get isProcessing() { return isTypewriterProcessing },
    get isPaused() { return isTypewriterPaused },
    get effect() { return typewriterEffect },
    skip: () => transformer?.skip(),
    pause: () => {
      transformer?.pause()
      isTypewriterPaused = true
    },
    resume: () => {
      transformer?.resume()
      isTypewriterPaused = false
    },
    setOptions: (opts) => {
      if (opts.enabled !== undefined) {
        typewriterEnabled = opts.enabled
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
        typewriterEffect = opts.effect
      }
      if (opts.cursor !== undefined) {
        typewriterCursor = opts.cursor
      }
    }
  }

  return {
    getBlocks,
    typewriter: typewriterControls,
    transformer,
    get isAnimationComplete() { return isAnimationComplete },
    get displayedFootnoteReferenceOrder() { return displayedFootnoteReferenceOrder }
  }
}
