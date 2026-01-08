import { ref, shallowRef, computed, markRaw, watch, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue'
import {
  createIncremarkParser,
  type IncremarkParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root,
  type TransformerPlugin,
  type AnimationEffect
} from '@incremark/core'
import { useProvideDefinations } from './useProvideDefinations'
import { useTypewriter } from './useTypewriter'

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

export interface UseIncremarkOptions extends IncremarkParserOptions {
  /** 打字机配置，传入即创建 transformer（可通过 enabled 控制是否启用） */
  typewriter?: TypewriterOptions
}

/** 打字机控制对象 */
export interface TypewriterControls {
  /** 是否启用（只读） */
  enabled: ComputedRef<boolean>
  /** 设置是否启用 */
  setEnabled: (enabled: boolean) => void
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
export function useIncremark(optionsInput: MaybeRefOrGetter<UseIncremarkOptions> = {}) {
  // 内部自动提供 definitions context
  const { setDefinations, setFootnoteDefinitions, setFootnoteReferenceOrder } = useProvideDefinations()

  // 创建解析器的工厂函数
  function createParser(options: UseIncremarkOptions) {
    return createIncremarkParser({
      ...options,
      onChange: (state) => {
        setDefinations(state.definitions)
        setFootnoteDefinitions(state.footnoteDefinitions)
        options.onChange?.(state)
      }
    })
  }

  // 解析器
  let parser = createParser(toValue(optionsInput))

  const completedBlocks = shallowRef<ParsedBlock[]>([])
  const pendingBlocks = shallowRef<ParsedBlock[]>([])
  const isLoading = ref(false)
  const markdown = ref('')
  const isFinalized = ref(false)
  const footnoteReferenceOrder = ref<string[]>([])

  // 使用 useTypewriter composable 管理打字机效果
  // 传入响应式的 typewriter 配置，让 useTypewriter 内部监听变化
  const { blocks, typewriter, transformer, isAnimationComplete } = useTypewriter({
    typewriter: () => toValue(optionsInput).typewriter,
    completedBlocks,
    pendingBlocks
  })

  // 内容是否完全显示完成
  // 如果没有配置打字机或未启用打字机：解析完成即显示完成
  // 如果启用打字机：解析完成 + 动画完成
  const isDisplayComplete = computed(() => {
    // 没有配置打字机，或者打字机未启用：只需判断是否 finalized
    if (!toValue(optionsInput).typewriter || !typewriter.enabled.value) {
      return isFinalized.value
    }
    // 启用了打字机：需要 finalize + 动画完成
    return isFinalized.value && isAnimationComplete.value
  })

  // AST
  const ast = computed<Root>(() => ({
    type: 'root',
    children: [
      ...completedBlocks.value.map((b) => b.node),
      ...pendingBlocks.value.map((b) => b.node)
    ]
  }))

  /**
   * 处理解析器更新结果（统一 append 和 finalize 的更新逻辑）
   */
  function handleUpdate(update: IncrementalUpdate, isFinalize: boolean = false): void {
    markdown.value = parser.getBuffer()

    if (update.completed.length > 0) {
      completedBlocks.value = [
        ...completedBlocks.value,
        ...update.completed.map((b) => markRaw(b))
      ]
    }
    pendingBlocks.value = update.pending.map((b) => markRaw(b))

    if (isFinalize) {
      isLoading.value = false
      isFinalized.value = true
    } else {
      isLoading.value = true
    }

    // 更新脚注引用顺序
    footnoteReferenceOrder.value = update.footnoteReferenceOrder
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)
  }

  function append(chunk: string): IncrementalUpdate {
    const update = parser.append(chunk)
    handleUpdate(update, false)
    return update
  }

  function finalize(): IncrementalUpdate {
    const update = parser.finalize()
    handleUpdate(update, true)
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

  // 监听 parser 相关 options 变化，动态更新配置（排除 typewriter 配置）
  // 使用 JSON.stringify 比较，避免 deep watch 对新对象的误触发
  // 注意：astBuilder 是类，需要单独处理
  watch(
    () => {
      const opts = toValue(optionsInput)
      const { typewriter: _, astBuilder, ...parserOptions } = opts
      // astBuilder 用名称标识，因为它是类不能 JSON.stringify
      return JSON.stringify(parserOptions) + '|' + (astBuilder?.name ?? 'default')
    },
    () => {
      // 使用 updateOptions 动态更新配置（包括引擎切换），不需要重建 parser
      const opts = toValue(optionsInput)
      const { typewriter: _, ...parserOptions } = opts
      parser.updateOptions(parserOptions)
      // 同步 Vue 状态
      completedBlocks.value = []
      pendingBlocks.value = []
      markdown.value = ''
      isLoading.value = false
      isFinalized.value = false
      footnoteReferenceOrder.value = []
      transformer?.reset()
    }
  )

  function render(content: string): IncrementalUpdate {
    const update = parser.render(content)

    markdown.value = parser.getBuffer()
    completedBlocks.value = parser.getCompletedBlocks().map(b => markRaw(b))
    pendingBlocks.value = []
    isLoading.value = false
    isFinalized.value = true
    footnoteReferenceOrder.value = update.footnoteReferenceOrder
    setFootnoteReferenceOrder(update.footnoteReferenceOrder)

    return update
  }

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
    /**
     * 内容是否完全显示完成
     * - 无打字机：等于 isFinalized
     * - 有打字机：isFinalized + 动画播放完成
     * 适用于控制 footnote 等需要在内容完全显示后才出现的元素
     */
    isDisplayComplete,
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
