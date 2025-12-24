<!--
  @file IncremarkCode.svelte - 代码块组件
  @description 渲染 Markdown 代码块，支持 Shiki 代码高亮和 Mermaid 图表渲染
-->

<script lang="ts">
  import type { Code } from 'mdast'
  import { onMount, onDestroy } from 'svelte'

  /**
   * 组件 Props
   */
  interface Props {
    /** 代码节点 */
    node: Code
    /** Shiki 主题，默认 github-dark */
    theme?: string
    /** 是否禁用代码高亮 */
    disableHighlight?: boolean
    /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
    mermaidDelay?: number
    /** 自定义代码块组件映射，key 为代码语言名称 */
    customCodeBlocks?: Record<string, any>
    /** 块状态，用于判断是否使用自定义组件 */
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let {
    node,
    theme = 'github-dark',
    disableHighlight = false,
    mermaidDelay = 500,
    customCodeBlocks,
    blockStatus = 'completed'
  }: Props = $props()

  // 状态
  let copied = $state(false)
  let highlightedHtml = $state('')
  let isHighlighting = $state(false)
  let highlightError = $state(false)

  // Mermaid 支持
  let mermaidSvg = $state('')
  let mermaidError = $state('')
  let mermaidLoading = $state(false)
  let mermaidRef: any = null
  let mermaidTimer: ReturnType<typeof setTimeout> | null = null
  // 视图模式：'preview' | 'source'
  let mermaidViewMode = $state<'preview' | 'source'>('preview')

  // 缓存 highlighter
  let highlighterRef: any = null
  const loadedLanguages = new Set<string>()
  const loadedThemes = new Set<string>()

  /**
   * 计算属性
   */
  const language = $derived(node.lang || 'text')
  const code = $derived(node.value)
  const isMermaid = $derived(language === 'mermaid')

  // 检查是否有自定义代码块组件
  const CustomCodeBlock = $derived.by(() => {
    // 如果代码块还在 pending 状态，不使用自定义组件
    if (blockStatus === 'pending') {
      return null
    }
    return customCodeBlocks?.[language] || null
  })

  // 是否使用自定义组件
  const useCustomComponent = $derived(!!CustomCodeBlock)

  /**
   * 切换 Mermaid 视图模式
   */
  function toggleMermaidView() {
    mermaidViewMode = mermaidViewMode === 'preview' ? 'source' : 'preview'
  }

  /**
   * Mermaid 渲染（带防抖动）
   */
  function scheduleRenderMermaid() {
    if (!isMermaid || !code) return

    // 清除之前的定时器
    if (mermaidTimer) {
      clearTimeout(mermaidTimer)
    }

    // 显示加载状态
    mermaidLoading = true

    // 防抖动延迟渲染
    mermaidTimer = setTimeout(() => {
      doRenderMermaid()
    }, mermaidDelay)
  }

  /**
   * 执行 Mermaid 渲染
   */
  async function doRenderMermaid() {
    if (!code) return

    mermaidError = ''

    try {
      // 动态导入 mermaid
      if (!mermaidRef) {
        // @ts-ignore - mermaid 是可选依赖
        const mermaidModule = await import('mermaid')
        mermaidRef = mermaidModule.default
        mermaidRef.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose'
        })
      }

      const mermaid = mermaidRef
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`

      const { svg } = await mermaid.render(id, code)
      mermaidSvg = svg
    } catch (e: any) {
      // 不显示错误，可能是代码还不完整
      mermaidError = ''
      mermaidSvg = ''
    } finally {
      mermaidLoading = false
    }
  }

  /**
   * 动态加载 shiki 并高亮
   */
  async function highlight() {
    if (isMermaid) {
      scheduleRenderMermaid()
      return
    }

    if (!code || disableHighlight) {
      highlightedHtml = ''
      return
    }

    isHighlighting = true
    highlightError = false

    try {
      // 动态导入 shiki
      if (!highlighterRef) {
        const { createHighlighter } = await import('shiki')
        highlighterRef = await createHighlighter({
          themes: [theme as any],
          langs: []
        })
        loadedThemes.add(theme)
      }

      const highlighter = highlighterRef
      const lang = language

      // 按需加载语言
      if (!loadedLanguages.has(lang) && lang !== 'text') {
        try {
          await highlighter.loadLanguage(lang)
          loadedLanguages.add(lang)
        } catch {
          // 语言不支持，标记但不阻止
        }
      }

      // 按需加载主题
      if (!loadedThemes.has(theme)) {
        try {
          await highlighter.loadTheme(theme)
          loadedThemes.add(theme)
        } catch {
          // 主题不支持
        }
      }

      const html = highlighter.codeToHtml(code, {
        lang: loadedLanguages.has(lang) ? lang : 'text',
        theme: loadedThemes.has(theme) ? theme : 'github-dark'
      })
      highlightedHtml = html
    } catch (e) {
      // Shiki 不可用或加载失败
      highlightError = true
      highlightedHtml = ''
    } finally {
      isHighlighting = false
    }
  }

  /**
   * 复制代码
   */
  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code)
      copied = true
      setTimeout(() => {
        copied = false
      }, 2000)
    } catch {
      // 复制失败静默处理
    }
  }

  // 监听代码变化，重新高亮/渲染
  $effect(() => {
    highlight()
  })

  // 清理
  onDestroy(() => {
    if (mermaidTimer) {
      clearTimeout(mermaidTimer)
    }
  })
</script>

<!-- 自定义代码块组件 -->
{#if useCustomComponent && CustomCodeBlock}
  <svelte:component 
    this={CustomCodeBlock} 
    codeStr={code} 
    lang={language}
  />
<!-- Mermaid 图表 -->
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
      <!-- 加载中 -->
      {#if mermaidLoading && !mermaidSvg}
        <pre class="mermaid-source-code">{code}</pre>
      <!-- 源码模式 -->
      {:else if mermaidViewMode === 'source'}
        <pre class="mermaid-source-code">{code}</pre>
      <!-- 预览模式 -->
      {:else if mermaidSvg}
        {@html mermaidSvg}
      <!-- 无法渲染时显示源码 -->
      {:else}
        <pre class="mermaid-source-code">{code}</pre>
      {/if}
    </div>
  </div>
{:else}
  <!-- 普通代码块 -->
  <div class="incremark-code">
    <div class="code-header">
      <span class="language">{language}</span>
      <button class="code-btn" onclick={copyCode} type="button">
        {copied ? '✓ 已复制' : '复制'}
      </button>
    </div>
    <div class="code-content">
      <!-- 正在加载高亮 -->
      {#if isHighlighting && !highlightedHtml}
        <div class="code-loading">
          <pre><code>{code}</code></pre>
        </div>
      <!-- 高亮后的代码 -->
      {:else if highlightedHtml}
        <div class="shiki-wrapper">
          {@html highlightedHtml}
        </div>
      <!-- 回退：无高亮 -->
      {:else}
        <pre class="code-fallback"><code>{code}</code></pre>
      {/if}
    </div>
  </div>
{/if}

