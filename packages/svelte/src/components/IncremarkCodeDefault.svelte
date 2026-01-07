<script lang="ts">
  import type { Code } from 'mdast'
  import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
  import SvgIcon from './SvgIcon.svelte'
  import { useShiki } from '../stores/useShiki.svelte'

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
  }

  let {
    node,
    theme = 'github-dark',
    fallbackTheme = 'github-dark',
    disableHighlight = false
  }: Props = $props()

  // 状态
  let copied = $state(false)
  let highlightedHtml = $state('')

  // 使用 Shiki 单例管理器
  const shiki = useShiki(() => theme)

  // 计算属性
  const language = $derived(node.lang || 'text')
  const code = $derived(node.value)

  /**
   * 动态加载 shiki 并高亮
   */
  async function doHighlight() {
    if (!code || disableHighlight) {
      highlightedHtml = ''
      return
    }

    try {
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
  })
</script>

<div class="incremark-code">
  <div class="code-header">
    <span class="language">{language}</span>
    <button 
      class="code-btn" 
      onclick={copyCode} 
      type="button"
      title={copied ? 'Copied!' : 'Copy'}
    >
      <SvgIcon svg={copied ? LucideCopyCheck : LucideCopy} />
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
