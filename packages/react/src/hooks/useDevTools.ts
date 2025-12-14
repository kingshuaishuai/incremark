import { useEffect, useRef } from 'react'
import { createDevTools, type DevToolsOptions } from '@incremark/devtools'
import type { UseIncremarkReturn } from './useIncremark'

export interface UseDevToolsOptions extends DevToolsOptions {}

/**
 * React DevTools 一行接入
 *
 * @example
 * ```tsx
 * import { useIncremark, useDevTools } from '@incremark/react'
 *
 * function App() {
 *   const incremark = useIncremark()
 *   useDevTools(incremark)  // 就这一行！
 *
 *   return <div>...</div>
 * }
 * ```
 */
export function useDevTools(
  incremark: UseIncremarkReturn,
  options: UseDevToolsOptions = {}
) {
  const devtoolsRef = useRef<ReturnType<typeof createDevTools> | null>(null)
  const optionsRef = useRef(options)

  useEffect(() => {
    const devtools = createDevTools(optionsRef.current)
    devtoolsRef.current = devtools

    // 设置 parser 的 onChange 回调
    incremark.parser.setOnChange((state) => {
      const blocks = [
        ...state.completedBlocks.map((b) => ({ ...b, stableId: b.id })),
        ...state.pendingBlocks.map((b, i) => ({ ...b, stableId: `pending-${i}` }))
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

    devtools.mount()

    return () => {
      devtools.unmount()
      incremark.parser.setOnChange(undefined)
    }
  }, [incremark.parser])

  return devtoolsRef.current
}
