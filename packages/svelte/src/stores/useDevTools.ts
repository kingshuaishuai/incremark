/**
 * @file useDevTools Store - DevTools 集成
 * @description Svelte 5 DevTools 一行接入
 */

import { onMount, onDestroy } from 'svelte'
import { createDevTools, type DevToolsOptions } from '@incremark/devtools'
import type { UseIncremarkReturn } from './useIncremark'

/**
 * useDevTools 选项
 */
export interface UseDevToolsOptions extends DevToolsOptions {}

/**
 * Svelte 5 DevTools 一行接入
 *
 * @description
 * 在组件中调用此函数以启用 DevTools
 *
 * @param incremark - useIncremark 返回的对象
 * @param options - DevTools 选项
 * @returns DevTools 实例
 *
 * @example
 * ```svelte
 * <script>
 *   import { useIncremark, useDevTools } from '@incremark/svelte'
 *
 *   const incremark = useIncremark()
 *   useDevTools(incremark)  // 就这一行！
 * </script>
 * ```
 */
export function useDevTools(
  incremark: UseIncremarkReturn,
  options: UseDevToolsOptions = {}
) {
  const devtools = createDevTools(options)

  // 设置 parser 的 onChange 回调
  incremark.parser.setOnChange((state) => {
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

  onMount(() => {
    devtools.mount()
  })

  onDestroy(() => {
    devtools.unmount()
    // 清理回调
    incremark.parser.setOnChange(undefined)
  })

  return devtools
}

