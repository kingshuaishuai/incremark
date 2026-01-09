<script lang="ts">
  import type { Code } from 'mdast'
  import { onDestroy } from 'svelte'
  import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
  import { isClipboardAvailable } from '@incremark/shared'
  import SvgIcon from './SvgIcon.svelte'
  import { useShiki } from '../stores/useShiki.svelte'
  import { useLocale } from '../stores/useLocale.svelte'
  import CachedCodeRenderer from './CachedCodeRenderer.svelte'

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
    /** block 状态 */
    blockStatus?: 'pending' | 'stable' | 'completed'
  }

  let {
    node,
    theme = 'github-dark',
    fallbackTheme = 'github-dark',
    disableHighlight = false,
    blockStatus = 'pending'
  }: Props = $props()

  // 状态
  let copied = $state(false)
  let isLanguageLoaded = $state(false)

  // 使用 Shiki 单例管理器
  const shiki = useShiki(() => theme)

  // 使用 i18n
  const { t } = useLocale()

  // 计算属性
  const language = $derived(node.lang || 'text')
  const code = $derived(node.value)

  // 是否应该启用高亮（需要有代码内容才开始高亮逻辑）
  const shouldEnableHighlight = $derived(!disableHighlight && code && code.length > 0)

  // 初始化 highlighter 并加载语言
  $effect(() => {
    // 如果不需要高亮，直接返回
    if (!shouldEnableHighlight) {
      return
    }

    // 使用立即执行的异步函数
    ;(async () => {
      if (!shiki.highlighterInfo) {
        await shiki.initHighlighter()
      } else if (language && language !== 'text') {
        // 检查语言是否已加载
        if (!shiki.highlighterInfo.loadedLanguages.has(language as any)) {
          try {
            isLanguageLoaded = false
            // 检查语言是否被 shiki 支持
            const supportedLangs = shiki.highlighterInfo.highlighter.getLoadedLanguages()
            const bundledLangs = await import('shiki').then(m => Object.keys(m.bundledLanguages || {}))
            const isSupported = supportedLangs.includes(language) || bundledLangs.includes(language)

            if (isSupported) {
              await shiki.highlighterInfo.highlighter.loadLanguage(language as any)
              shiki.highlighterInfo.loadedLanguages.add(language as any)
            }
            // 无论是否支持，都标记为已加载（不支持的语言会 fallback 到纯文本显示）
            isLanguageLoaded = true
          } catch {
            // 语言加载失败，标记为已加载（回退到无高亮）
            isLanguageLoaded = true
          }
        } else {
          isLanguageLoaded = true
        }
      } else {
        // text 语言不需要加载
        isLanguageLoaded = true
      }
    })()
  })

  let copyTimeoutId: ReturnType<typeof setTimeout> | null = null

  /**
   * 复制代码
   */
  async function copyCode() {
    if (!isClipboardAvailable()) return

    try {
      await navigator.clipboard.writeText(code)
      copied = true

      if (copyTimeoutId) clearTimeout(copyTimeoutId)
      copyTimeoutId = setTimeout(() => { copied = false }, 2000)
    } catch { /* 静默处理 */ }
  }

  onDestroy(() => {
    if (copyTimeoutId) clearTimeout(copyTimeoutId)
  })
</script>

<div class="incremark-code">
  <div class="code-header">
    <span class="language">{language}</span>
    <button
      class="code-btn"
      onclick={copyCode}
      type="button"
      aria-label={copied ? t('code.copied') : t('code.copy')}
      title={copied ? 'Copied!' : 'Copy'}
    >
      <SvgIcon svg={copied ? LucideCopyCheck : LucideCopy} />
    </button>
  </div>
  <div class="code-content">
    <div class="shiki-wrapper">
      {#if shouldEnableHighlight && shiki.highlighterInfo && isLanguageLoaded}
        <!-- Stream 高亮（只有当存在代码内容且语言加载完成后才渲染） -->
        <CachedCodeRenderer
          code={code}
          lang={language}
          theme={theme}
          highlighter={shiki.highlighterInfo.highlighter}
        />
      {:else}
        <!-- 无高亮模式（禁用高亮、无代码内容、或语言未加载完成时显示） -->
        <pre class="code-fallback"><code>{code}</code></pre>
      {/if}
    </div>
  </div>
</div>
