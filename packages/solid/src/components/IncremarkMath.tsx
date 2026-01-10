/* @jsxImportSource solid-js */

import { Component, createSignal, createEffect, onCleanup, Show } from 'solid-js'
import type { JSX } from 'solid-js'

// Math 节点类型（来自 mdast-util-math）
export interface MathNode {
  type: 'math' | 'inlineMath'
  value: string
  data?: {
    hName?: string
    hProperties?: Record<string, any>
  }
}

export interface IncremarkMathProps {
  node: MathNode
  /** 渲染延迟（毫秒），用于流式输入时防抖 */
  renderDelay?: number
}

export const IncremarkMath: Component<IncremarkMathProps> = (props) => {
  const [renderedHtml, setRenderedHtml] = createSignal('')
  const [isLoading, setIsLoading] = createSignal(false)

  const isInline = () => props.node.type === 'inlineMath'
  const formula = () => props.node.value

  let renderTimer: ReturnType<typeof setTimeout> | null = null
  let katexRef: any = null

  // 带防抖动的渲染
  function scheduleRender() {
    if (!formula()) {
      setRenderedHtml('')
      return
    }

    // 清除之前的定时器
    if (renderTimer) {
      clearTimeout(renderTimer)
    }

    setIsLoading(true)

    // 防抖动延迟渲染
    renderTimer = setTimeout(() => {
      doRender()
    }, props.renderDelay ?? 0)
  }

  async function doRender() {
    if (!formula()) return

    try {
      // 动态导入 KaTeX
      if (!katexRef) {
        const katexModule = await import('katex')
        katexRef = katexModule.default
      }

      const katex = katexRef
      setRenderedHtml(katex.renderToString(formula(), {
        displayMode: !isInline(),
        throwOnError: false,
        strict: false
      }))
    } catch {
      // 静默失败，可能是公式不完整
      setRenderedHtml('')
    } finally {
      setIsLoading(false)
    }
  }

  createEffect(() => {
    scheduleRender()
  })

  onCleanup(() => {
    if (renderTimer) {
      clearTimeout(renderTimer)
    }
  })

  // 行内公式
  if (isInline()) {
    return (
      <span class="incremark-math-inline">
        <Show when={renderedHtml() && !isLoading()}>
          <span innerHTML={renderedHtml()} />
        </Show>
        <Show when={!renderedHtml() || isLoading()}>
          <code class="math-source">{formula()}</code>
        </Show>
      </span>
    )
  }

  // 块级公式
  return (
    <div class="incremark-math-block">
      <Show when={renderedHtml() && !isLoading()}>
        <div innerHTML={renderedHtml()} class="math-rendered" />
      </Show>
      <Show when={!renderedHtml() || isLoading()}>
        <pre class="math-source-block"><code>{formula()}</code></pre>
      </Show>
    </div>
  )
}
