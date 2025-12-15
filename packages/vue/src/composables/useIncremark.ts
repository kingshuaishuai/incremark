import { ref, shallowRef, computed, markRaw } from 'vue'
import {
  IncremarkParser,
  createIncremarkParser,
  type ParserOptions,
  type ParsedBlock,
  type IncrementalUpdate,
  type Root
} from '@incremark/core'

export interface UseIncremarkOptions extends ParserOptions {}

/** useIncremark 的返回类型 */
export type UseIncremarkReturn = ReturnType<typeof useIncremark>

/**
 * Vue 3 Composable: Incremark 流式 Markdown 解析器
 *
 * @example
 * ```vue
 * <script setup>
 * import { useIncremark } from '@incremark/vue'
 *
 * const { markdown, blocks, append, finalize } = useIncremark()
 *
 * // 处理 AI 流式输出
 * async function handleStream(stream) {
 *   for await (const chunk of stream) {
 *     append(chunk)
 *   }
 *   finalize()
 * }
 * </script>
 *
 * <template>
 *   <div>已接收: {{ markdown.length }} 字符</div>
 * </template>
 * ```
 */
export function useIncremark(options: UseIncremarkOptions = {}) {
  const parser = createIncremarkParser(options)
  const completedBlocks = shallowRef<ParsedBlock[]>([])
  const pendingBlocks = shallowRef<ParsedBlock[]>([])
  const isLoading = ref(false)
  // 使用 ref 存储 markdown，确保响应式
  const markdown = ref('')

  const ast = computed<Root>(() => ({
    type: 'root',
    children: [
      ...completedBlocks.value.map((b) => b.node),
      ...pendingBlocks.value.map((b) => b.node)
    ]
  }))

  // 所有块，带稳定 ID（已完成块用真实 ID，待处理块用索引）
  const blocks = computed(() => {
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

  function append(chunk: string): IncrementalUpdate {
    isLoading.value = true
    const update = parser.append(chunk)

    // 更新 markdown ref
    markdown.value = parser.getBuffer()

    // 使用 markRaw 避免深层响应式
    if (update.completed.length > 0) {
      completedBlocks.value = [
        ...completedBlocks.value,
        ...update.completed.map((b) => markRaw(b))
      ]
    }
    pendingBlocks.value = update.pending.map((b) => markRaw(b))

    return update
  }

  function finalize(): IncrementalUpdate {
    const update = parser.finalize()

    // 更新 markdown ref
    markdown.value = parser.getBuffer()

    if (update.completed.length > 0) {
      completedBlocks.value = [
        ...completedBlocks.value,
        ...update.completed.map((b) => markRaw(b))
      ]
    }
    pendingBlocks.value = []
    isLoading.value = false

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
  }

  /**
   * 一次性渲染完整 Markdown（reset + append + finalize）
   * @param content 完整的 Markdown 内容
   */
  function render(content: string): IncrementalUpdate {
    // 调用 parser 的 render 方法
    const update = parser.render(content)

    // 同步状态
    markdown.value = parser.getBuffer()
    completedBlocks.value = parser.getCompletedBlocks().map(b => markRaw(b))
    pendingBlocks.value = []
    isLoading.value = false

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
    /** 所有块（完成 + 待处理），带稳定 ID */
    blocks,
    /** 是否正在加载 */
    isLoading,
    /** 追加内容 */
    append,
    /** 完成解析 */
    finalize,
    /** 强制中断 */
    abort,
    /** 重置解析器 */
    reset,
    /** 一次性渲染（reset + append + finalize） */
    render,
    /** 解析器实例 */
    parser
  }
}
