/* @jsxImportSource solid-js */

import type { Code } from 'mdast'
import { Component, createEffect, createSignal, onCleanup, Show } from 'solid-js'
import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
import { isClipboardAvailable } from '@incremark/shared'
import { useShiki } from '../composables/useShiki'
import { useLocale } from '../composables/useLocale'
import { CachedCodeRenderer } from './CachedCodeRenderer'
import { SvgIcon } from './SvgIcon'

export interface IncremarkCodeDefaultProps {
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

export const IncremarkCodeDefault: Component<IncremarkCodeDefaultProps> = (props) => {
  const [copied, setCopied] = createSignal(false)

  const language = () => props.node.lang || 'text'
  const code = () => props.node.value

  // 使用 i18n
  const t = useLocale()

  // 使用 Shiki 单例管理器
  const { highlighterInfo, initHighlighter } = useShiki(props.theme ?? 'github-dark')

  // 语言是否已加载完成
  const [isLanguageLoaded, setIsLanguageLoaded] = createSignal(false)

  // 是否应该启用高亮（需要有代码内容才开始高亮逻辑）
  const shouldEnableHighlight = () => {
    return !props.disableHighlight && code() && code().length > 0
  }

  // 初始化 highlighter 并加载语言
  // 只有当存在代码内容时才开始加载语言，避免流式渲染时语言标识不完整导致的错误
  createEffect(async () => {
    const info = highlighterInfo()
    const lang = language()
    const shouldHighlight = shouldEnableHighlight()

    // 如果不需要高亮，直接返回
    if (!shouldHighlight) {
      return
    }

    if (!info) {
      await initHighlighter()
    } else if (lang && lang !== 'text') {
      // 检查语言是否已加载
      if (!info.loadedLanguages.has(lang as any)) {
        try {
          setIsLanguageLoaded(false)
          // 检查语言是否被 shiki 支持
          const supportedLangs = info.highlighter.getLoadedLanguages()
          const bundledLangs = await import('shiki').then(m => Object.keys(m.bundledLanguages || {}))
          const isSupported = supportedLangs.includes(lang) || bundledLangs.includes(lang)

          if (isSupported) {
            await info.highlighter.loadLanguage(lang as any)
            info.loadedLanguages.add(lang as any)
          }
          // 无论是否支持，都标记为已加载（不支持的语言会 fallback 到纯文本显示）
          setIsLanguageLoaded(true)
        } catch {
          // 语言加载失败，标记为已加载（回退到无高亮）
          setIsLanguageLoaded(true)
        }
      } else {
        setIsLanguageLoaded(true)
      }
    } else {
      // text 语言不需要加载
      setIsLanguageLoaded(true)
    }
  })

  let copyTimeoutId: ReturnType<typeof setTimeout> | null = null

  onCleanup(() => {
    if (copyTimeoutId) {
      clearTimeout(copyTimeoutId)
    }
  })

  async function copyCode() {
    if (!isClipboardAvailable()) return

    try {
      await navigator.clipboard.writeText(code())
      setCopied(true)

      // 清理之前的定时器
      if (copyTimeoutId) {
        clearTimeout(copyTimeoutId)
      }

      copyTimeoutId = setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch {
      // 复制失败静默处理
    }
  }

  return (
    <div class="incremark-code">
      <div class="code-header">
        <span class="language">{language()}</span>
        <button
          class="code-btn"
          onClick={copyCode}
          type="button"
          aria-label={copied() ? t('code.copied') : t('code.copy')}
          title={copied() ? 'Copied!' : 'Copy'}
        >
          <SvgIcon svg={copied() ? LucideCopyCheck : LucideCopy} />
        </button>
      </div>
      <div class="code-content">
        <div class="shiki-wrapper">
          {/* Stream 高亮（只有当存在代码内容且语言加载完成后才渲染） */}
          <Show
            when={shouldEnableHighlight() && highlighterInfo() && isLanguageLoaded()}
            fallback={
              // 无高亮模式（禁用高亮、无代码内容、或语言未加载完成时显示）
              <pre class="code-fallback"><code>{code()}</code></pre>
            }
          >
            <CachedCodeRenderer
              code={code()}
              lang={language()}
              theme={props.theme ?? 'github-dark'}
              highlighter={highlighterInfo()!.highlighter}
            />
          </Show>
        </div>
      </div>
    </div>
  )
}
