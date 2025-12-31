<script lang="ts">
  import type { Code } from 'mdast'
  import { useShiki } from '../stores/useShiki'

  /**
   * 组件 Props
   */
  interface Props {
    /** 代码节点 */
    node: Code
    /** Shiki 主题，默认 github-dark */
    theme?: string
    /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
    fallbackTheme?: string
    /** 是否禁用代码高亮 */
    disableHighlight?: boolean
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
    /** 自定义代码块组件映射，key 为代码语言名称 */
    customCodeBlocks?: Record<string, any>
    /** 代码块配置映射，key 为代码语言名称 */
    codeBlockConfigs?: Record<string, { takeOver?: boolean }>
    /** 块状态，用于判断是否使用自定义组件 */
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let {
    node,
    theme = 'github-dark',
    fallbackTheme = 'github-dark',
    disableHighlight = false,
    mermaidDelay = 500,
    customCodeBlocks,
    codeBlockConfigs,
    blockStatus = 'completed'
  }: Props = $props()

  // 状态
  let copied = $state(false)
  let highlightedHtml = $state('')

  // Mermaid 支持
  let mermaidSvg = $state('')
  let mermaidError = $state('')
  let mermaidLoading = $state(false)
  let mermaidRef: any = null
  let mermaidTimer: ReturnType<typeof setTimeout> | null = null
  // 视图模式：'preview' | 'source'
  let mermaidViewMode = $state<'preview' | 'source'>('preview')

  // 使用 Shiki 单例管理器 - 修复：传入 getter 闭包以保持响应式
  const shiki = useShiki(() => theme)

  /**
   * 计算属性
   */
  const language = $derived(node.lang || 'text')
  const code = $derived(node.value)
  const isMermaid = $derived(language === 'mermaid')

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = $derived.by(() => {
    const component = customCodeBlocks?.[language]
    if (!component) return null

    const config = codeBlockConfigs?.[language]

    if (config?.takeOver) return component
    if (blockStatus !== 'completed') return null

    return component
  })

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
    mermaidError = ''

    try {
      if (!mermaidRef) {
        // @ts-ignore
        const mermaidModule = await import('mermaid')
        mermaidRef = mermaidModule.default
        mermaidRef.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose'
        })
      }

      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const { svg } = await mermaidRef.render(id, code)
      mermaidSvg = svg
    } catch (e: any) {
      mermaidError = ''
      mermaidSvg = ''
    } finally {
      mermaidLoading = false
    }
  }

  /**
   * 动态加载 shiki 并高亮
   */
  async function doHighlight() {
    if (isMermaid) {
      // Mermaid 防抖逻辑
      if (mermaidTimer) clearTimeout(mermaidTimer)
      mermaidLoading = true
      mermaidTimer = setTimeout(doRenderMermaid, mermaidDelay)
      return
    }

    if (!code || disableHighlight) {
      highlightedHtml = ''
      return
    }

    try {
      // 调用经过修复的 shiki.highlight
      const html = await shiki.highlight(code, language, fallbackTheme)
      highlightedHtml = html
    } catch (e) {
      highlightedHtml = ''
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

  // 监听代码、主题、语言变化并重新渲染
  $effect(() => {
    doHighlight()
    
    // 返回清理函数取代 onDestroy
    return () => {
      if (mermaidTimer) clearTimeout(mermaidTimer)
    }
  })
</script>

{#if CustomCodeBlock}
  {@const Component = CustomCodeBlock}
  <Component 
    codeStr={code} 
    lang={language} 
    completed={blockStatus === 'completed'} 
    takeOver={codeBlockConfigs?.[language]?.takeOver} 
  />
{:else if isMermaid}
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
{:else}
  <div class="incremark-code">
    <div class="code-header">
      <span class="language">{language}</span>
      <button class="code-btn" onclick={copyCode} type="button">
        {copied ? '✓ 已复制' : '复制'}
      </button>
    </div>
    <div class="code-content">
      {#if shiki.isHighlighting && !highlightedHtml}
        <div class="code-loading">
          <pre><code>{code}</code></pre>
        </div>
      {:else if highlightedHtml}
        <div class="shiki-wrapper">
          {@html highlightedHtml}
        </div>
      {:else}
        <pre class="code-fallback"><code>{code}</code></pre>
      {/if}
    </div>
  </div>
{/if}
