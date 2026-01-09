import { onMounted, onUnmounted } from 'vue'
import { createDevTools, type DevToolsOptions } from '@incremark/devtools'
import type { UseIncremarkReturn } from './useIncremark'

export interface UseDevToolsOptions extends DevToolsOptions {}

/**
 * Vue 3 DevTools 一行接入
 *
 * @example
 * ```vue
 * <script setup>
 * import { useIncremark, useDevTools } from '@incremark/vue'
 *
 * const incremark = useIncremark()
 * useDevTools(incremark)  // 就这一行！
 * </script>
 * ```
 */
export function useDevTools(
  incremark: UseIncremarkReturn,
  options: UseDevToolsOptions = {}
) {
  const devtools = createDevTools(options)

  // 设置 parser 的 onChange 回调
  incremark.parser.setOnChange((state: any) => {
    const blocks = [
      ...state.completedBlocks,
      ...state.pendingBlocks
    ]

    devtools.update({
      blocks,
      completedBlocks: state.completedBlocks,
      pendingBlocks: state.pendingBlocks,
      markdown: state.markdown,
      ast: state.ast,
      isLoading: state.pendingBlocks.length > 0
    })
  })

  onMounted(() => {
    devtools.mount()
  })

  onUnmounted(() => {
    devtools.unmount()
    // 清理回调
    incremark.parser.setOnChange(undefined)
  })

  return devtools
}
