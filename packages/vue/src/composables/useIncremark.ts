import { ref, shallowRef, computed, markRaw, watch, onUnmounted, type Ref, type ComputedRef } from 'vue'
import {
  IncremarkParser,
  createIncremarkParser,
  createBlockTransformer,
  defaultPlugins,
  type ParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type RootContent,
  type DisplayBlock,
  type TransformerPlugin,
  type AnimationEffect,
  type BlockTransformer
} from '@incremark/core'
import { useProvideDefinations } from './useProvideDefinations'

/** 打字机效果配置 */
export interface TypewriterOptions {
  /** 是否启用打字机效果（可响应式切换） */
  enabled?: boolean
  /** 每次显示的字符数，可以是固定值或范围 [min, max] */
  charsPerTick?: number | [number, number]
  /** 更新间隔 (ms) */
  tickInterval?: number
  /** 动画效果: 'none' | 'fade-in' | 'typing' */
  effect?: AnimationEffect
  /** 光标字符（仅 typing 效果使用） */
  cursor?: string
  /** 页面不可见时暂停 */
  pauseOnHidden?: boolean
  /** 自定义插件 */
  plugins?: TransformerPlugin[]
}

export interface UseIncremarkOptions extends ParserOptions {
  /** 打字机配置，传入即创建 transformer（可通过 enabled 控制是否启用） */
  typewriter?: TypewriterOptions
}

/** 打字机控制对象 */
export interface TypewriterControls {
  /** 是否启用 */
  enabled: Ref<boolean>
  /** 是否正在处理中 */
  isProcessing: ComputedRef<boolean>
  /** 是否已暂停 */
  isPaused: ComputedRef<boolean>
  /** 当前动画效果 */
  effect: ComputedRef<AnimationEffect>
  /** 跳过动画，直接显示全部 */
  skip: () => void
  /** 暂停动画 */
  pause: () => void
  /** 恢复动画 */
  resume: () => void
  /** 动态更新配置 */
  setOptions: (options: Partial<TypewriterOptions>) => void
}

/** useIncremark 的返回类型 */
export type UseIncremarkReturn = ReturnType<typeof useIncremark>

/**
 * Vue 3 Composable: Incremark 流式 Markdown 解析器
 *
 * @example
 * ```vue
 * <script setup>
 * import { useIncremark, Incremark } from '@incremark/vue'
 *
 * // 基础用法
 * const { blocks, append, finalize } = useIncremark()
 *
 * // 启用打字机效果
 * const { blocks, append, finalize, typewriter } = useIncremark({
 *   typewriter: {
 *     enabled: true,       // 可响应式切换
 *     charsPerTick: [1, 3],
 *     tickInterval: 30,
 *     effect: 'typing',
 *     cursor: '|'
 *   }
 * })
 *
 * // 动态切换打字机效果
 * typewriter.enabled.value = false
 * </script>
 *
 * <template>
 *   <Incremark :blocks="blocks" />
 *   <button v-if="typewriter.isProcessing.value" @click="typewriter.skip">跳过</button>
 * </template>
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}) {
  const { setDefinations, setFootnoteDefinitions } = useProvideDefinations();
  // 解析器
  const parser = createIncremarkParser({
    ...options,
    onChange: (state) => {
      setDefinations(state.definitions);
      setFootnoteDefinitions(state.footnoteDefinitions);
    }
  })
  const completedBlocks = shallowRef<ParsedBlock[]>([])
  const pendingBlocks = shallowRef<ParsedBlock[]>([])
  const isLoading = ref(false)
  const markdown = ref('')
  const isFinalized = ref(false)
  const footnoteReferenceOrder = ref<string[]>([])

  // 打字机相关状态
  const typewriterEnabled = ref(options.typewriter?.enabled ?? !!options.typewriter)
  const displayBlocksRef = shallowRef<DisplayBlock<RootContent>[]>([])
  const isTypewriterProcessing = ref(false)
  const isTypewriterPaused = ref(false)
  const typewriterEffect = ref<AnimationEffect>(options.typewriter?.effect ?? 'none')
  const typewriterCursor = ref(options.typewriter?.cursor ?? '|')

  // 创建 transformer（如果有 typewriter 配置）
  let transformer: BlockTransformer<RootContent> | null = null

  if (options.typewriter) {
    const twOptions = options.typewriter
    transformer = createBlockTransformer<RootContent>({
      charsPerTick: twOptions.charsPerTick ?? [1, 3],
      tickInterval: twOptions.tickInterval ?? 30,
      effect: twOptions.effect ?? 'none',
      pauseOnHidden: twOptions.pauseOnHidden ?? true,
      plugins: twOptions.plugins ?? defaultPlugins,
      onChange: (blocks) => {
        displayBlocksRef.value = blocks as DisplayBlock<RootContent>[]
        isTypewriterProcessing.value = transformer?.isProcessing() ?? false
        isTypewriterPaused.value = transformer?.isPausedState() ?? false
      }
    })
  }

  // AST
  const ast = computed<Root>(() => ({
    type: 'root',
    children: [
      ...completedBlocks.value.map((b) => b.node),
      ...pendingBlocks.value.map((b) => b.node)
    ]
  }))

  // 将 completedBlocks 转换为 SourceBlock 格式
  const sourceBlocks = computed(() => {
    return completedBlocks.value.map(block => ({
      id: block.id,
      node: block.node,
      status: block.status as 'pending' | 'stable' | 'completed'
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

  /**
   * 在节点末尾添加光标
   */
  function addCursorToNode(node: RootContent, cursor: string): RootContent {
    const cloned = JSON.parse(JSON.stringify(node))

    function addToLast(n: { children?: unknown[]; type?: string; value?: string }): boolean {
      if (n.children && n.children.length > 0) {
        for (let i = n.children.length - 1; i >= 0; i--) {
          if (addToLast(n.children[i] as { children?: unknown[]; type?: string; value?: string })) {
            return true
          }
        }
        n.children.push({ type: 'text', value: cursor })
        return true
      }
      if (n.type === 'text' && typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      if (typeof n.value === 'string') {
        n.value += cursor
        return true
      }
      return false
    }

    addToLast(cloned)
    return cloned
  }

  // 原始 blocks（不经过打字机）
  const rawBlocks = computed(() => {
    const result: Array<ParsedBlock & { stableId: string }> = []

    for (const block of completedBlocks.value) {
      result.push({ ...block, stableId: block.id })
    }

    for (let i = 0; i < pendingBlocks.value.length; i++) {
      result.push({
        ...pendingBlocks.value[i],
        stableId: `pending-${i}`
      })
    }

    return result
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
        stableId: db.id,
        status: (db.isDisplayComplete ? 'completed' : 'pending') as 'pending' | 'stable' | 'completed',
        isLastPending,
        node,
        startOffset: 0,
        endOffset: 0,
        rawText: ''
      }
    })
  })

  function append(chunk: string): IncrementalUpdate {
    isLoading.value = true
    const update = parser.append(chunk)

    markdown.value = parser.getBuffer()

    if (update.completed.length > 0) {
      completedBlocks.value = [
        ...completedBlocks.value,
        ...update.completed.map((b) => markRaw(b))
      ]
    }
    pendingBlocks.value = update.pending.map((b) => markRaw(b))
    
    // 更新脚注引用顺序
    footnoteReferenceOrder.value = update.footnoteReferenceOrder

    return update
  }

  function finalize(): IncrementalUpdate {
    const update = parser.finalize()

    markdown.value = parser.getBuffer()

    if (update.completed.length > 0) {
      completedBlocks.value = [
        ...completedBlocks.value,
        ...update.completed.map((b) => markRaw(b))
      ]
    }
    pendingBlocks.value = []
    isLoading.value = false
    isFinalized.value = true
    
    // 更新脚注引用顺序
    footnoteReferenceOrder.value = update.footnoteReferenceOrder

    return update
  }

  function abort(): IncrementalUpdate {
    return finalize()
  }

  function reset(): void {
    parser.reset()
    completedBlocks.value = []
    pendingBlocks.value = []
    markdown.value = ''
    isLoading.value = false
    isFinalized.value = false
    footnoteReferenceOrder.value = []

    // 重置 transformer
    transformer?.reset()
  }

  function render(content: string): IncrementalUpdate {
    const update = parser.render(content)

    markdown.value = parser.getBuffer()
    completedBlocks.value = parser.getCompletedBlocks().map(b => markRaw(b))
    pendingBlocks.value = []
    isLoading.value = false
    isFinalized.value = true
    footnoteReferenceOrder.value = update.footnoteReferenceOrder
    console.log(">>>> footnoteReferenceOrder3", update.footnoteReferenceOrder)
    return update
  }

  // 打字机控制对象
  const typewriter: TypewriterControls = {
    enabled: typewriterEnabled,
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
    /** 已收集的完整 Markdown 字符串 */
    markdown,
    /** 已完成的块列表 */
    completedBlocks,
    /** 待处理的块列表 */
    pendingBlocks,
    /** 当前完整的 AST */
    ast,
    /** 用于渲染的 blocks（根据打字机设置自动处理） */
    blocks,
    /** 是否正在加载 */
    isLoading,
    /** 是否已完成（finalize） */
    isFinalized,
    /** 脚注引用的出现顺序 */
    footnoteReferenceOrder,
    /** 追加内容 */
    append,
    /** 完成解析 */
    finalize,
    /** 强制中断 */
    abort,
    /** 重置解析器和打字机 */
    reset,
    /** 一次性渲染（reset + append + finalize） */
    render,
    /** 解析器实例 */
    parser,
    /** 打字机控制 */
    typewriter
  }
}
