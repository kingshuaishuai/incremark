<script lang="ts">
  import type { Code } from 'mdast'

  /**
   * 组件 Props
   */
  interface Props {
    /** 代码节点 */
    node: Code
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
  }

  let {
    node,
    mermaidDelay = 500
  }: Props = $props()

  // 状态
  let copied = $state(false)
  let mermaidSvg = $state('')
  let mermaidLoading = $state(false)
  let mermaidRef: any = null
  let mermaidTimer: ReturnType<typeof setTimeout> | null = null
  let mermaidViewMode = $state<'preview' | 'source'>('preview')

  // 计算属性
  const code = $derived(node.value)

  /**
   * 切换 Mermaid 视图模式
   */
  function toggleMermaidView() {
    mermaidViewMode = mermaidViewMode === 'preview' ? 'source' : 'preview'
  }

  /**
   * 执行 Mermaid 渲染
   */
  async function doRenderMermaid() {
    if (!code) return

    try {
      if (!mermaidRef) {
        // @ts-ignore
        const mermaidModule = await import('mermaid')
        mermaidRef = mermaidModule.default
        mermaidRef.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
          suppressErrorRendering: true
        })
      }

      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const { svg } = await mermaidRef.render(id, code)
      mermaidSvg = svg
    } catch (e: any) {
      mermaidSvg = ''
    } finally {
      mermaidLoading = false
    }
  }

  /**
   * 复制代码
   */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      setTimeout(() => { copied = false }, 2000)
    } catch { /* 静默处理 */ }
  }

  // 监听代码变化并重新渲染
  $effect(() => {
    // Mermaid 防抖逻辑
    if (mermaidTimer) clearTimeout(mermaidTimer)
    mermaidLoading = true
    mermaidTimer = setTimeout(doRenderMermaid, mermaidDelay)
    
    // 返回清理函数
    return () => {
      if (mermaidTimer) clearTimeout(mermaidTimer)
    }
  })
</script>

<div class="incremark-mermaid">
  <div class="mermaid-header">
    <span class="language">MERMAID</span>
    <div class="mermaid-actions">
      <button 
        class="code-btn" 
        onclick={toggleMermaidView} 
        type="button"
        disabled={!mermaidSvg}
      >
        {mermaidViewMode === 'preview' ? '源码' : '预览'}
      </button>
      <button class="code-btn" onclick={copyCode} type="button">
        {copied ? '✓ 已复制' : '复制'}
      </button>
    </div>
  </div>
  <div class="mermaid-content">
    {#if mermaidLoading && !mermaidSvg}
      <pre class="mermaid-source-code">{code}</pre>
    {:else if mermaidViewMode === 'source'}
      <pre class="mermaid-source-code">{code}</pre>
    {:else if mermaidSvg}
      {@html mermaidSvg}
    {:else}
      <pre class="mermaid-source-code">{code}</pre>
    {/if}
  </div>
</div>

