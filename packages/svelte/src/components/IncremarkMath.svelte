<!--
  @file IncremarkMath.svelte - 数学公式组件
  @description 渲染 Markdown 数学公式（行内和块级），使用 KaTeX 渲染
-->

<script lang="ts">
  import { onDestroy } from 'svelte'

  /**
   * Math 节点类型（来自 mdast-util-math）
   */
  interface MathNode {
    type: 'math' | 'inlineMath'
    value: string
    data?: {
      hName?: string
      hProperties?: Record<string, any>
    }
  }

  /**
   * 组件 Props
   */
  interface Props {
    /** 数学公式节点 */
    node: MathNode
    /** 渲染延迟（毫秒），用于流式输入时防抖 */
    renderDelay?: number
  }

  let {
    node,
    renderDelay = 0
  }: Props = $props()

  // 状态
  let renderedHtml = $state('')
  let renderError = $state('')
  let isLoading = $state(false)
  let katexRef: any = null
  let renderTimer: ReturnType<typeof setTimeout> | null = null

  /**
   * 计算属性
   */
  const isInline = $derived(node.type === 'inlineMath')
  const formula = $derived(node.value)

  /**
   * 带防抖动的渲染
   */
  function scheduleRender() {
    if (!formula) {
      renderedHtml = ''
      return
    }

    // 清除之前的定时器
    if (renderTimer) {
      clearTimeout(renderTimer)
    }

    isLoading = true

    // 防抖动延迟渲染
    renderTimer = setTimeout(() => {
      doRender()
    }, renderDelay)
  }

  /**
   * 执行渲染
   */
  async function doRender() {
    if (!formula) return

    try {
      // 动态导入 KaTeX
      if (!katexRef) {
        // @ts-ignore - katex 是可选依赖
        const katexModule = await import('katex')
        katexRef = katexModule.default
      }

      const katex = katexRef
      renderedHtml = katex.renderToString(formula, {
        displayMode: !isInline,
        throwOnError: false,
        strict: false
      })
      renderError = ''
    } catch (e: any) {
      // 静默失败，可能是公式不完整
      renderError = ''
      renderedHtml = ''
    } finally {
      isLoading = false
    }
  }

  // 监听公式变化，重新渲染
  $effect(() => {
    scheduleRender()
  })

  // 清理
  onDestroy(() => {
    if (renderTimer) {
      clearTimeout(renderTimer)
    }
  })
</script>

<!-- 行内公式 -->
{#if isInline}
  <span class="incremark-math-inline">
    <!-- 渲染成功 -->
    {#if renderedHtml && !isLoading}
      {@html renderedHtml}
    <!-- 加载中或未渲染：显示源码 -->
    {:else}
      <code class="math-source">{formula}</code>
    {/if}
  </span>
{:else}
  <!-- 块级公式 -->
  <div class="incremark-math-block">
    <!-- 渲染成功 -->
    {#if renderedHtml && !isLoading}
      <div class="math-rendered">{@html renderedHtml}</div>
    <!-- 加载中或未渲染：显示源码 -->
    {:else}
      <pre class="math-source-block"><code>{formula}</code></pre>
    {/if}
  </div>
{/if}

