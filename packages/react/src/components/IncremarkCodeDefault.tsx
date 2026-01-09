import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import type { Code } from 'mdast'
import { LucideCopy, LucideCopyCheck } from '@incremark/icons'
import { isClipboardAvailable } from '@incremark/shared'
import { SvgIcon } from './SvgIcon'
import { useShiki } from '../hooks/useShiki'
import { useLocale } from '../hooks/useLocale'
import { CachedCodeRenderer } from './CachedCodeRenderer'

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

export const IncremarkCodeDefault: React.FC<IncremarkCodeDefaultProps> = ({
  node,
  theme = 'github-dark',
  fallbackTheme = 'github-dark',
  disableHighlight = false,
  blockStatus = 'pending'
}) => {
  const [copied, setCopied] = useState(false)
  const [isLanguageLoaded, setIsLanguageLoaded] = useState(false)

  const language = useMemo(() => node.lang || 'text', [node.lang])
  const code = useMemo(() => node.value, [node.value])

  // 使用 i18n
  const { t } = useLocale()

  // 使用 Shiki 单例管理器
  const { highlighterInfo, initHighlighter } = useShiki(theme)

  // 是否应该启用高亮（需要有代码内容才开始高亮逻辑）
  const shouldEnableHighlight = useMemo(() => {
    return !disableHighlight && code && code.length > 0
  }, [disableHighlight, code])

  // 初始化 highlighter 并加载语言
  // 只有当存在代码内容时才开始加载语言，避免流式渲染时语言标识不完整导致的错误
  useEffect(() => {
    const loadLanguageIfNeeded = async () => {
      // 如果不需要高亮，直接返回
      if (!shouldEnableHighlight) {
        return
      }

      if (!highlighterInfo) {
        await initHighlighter()
      } else if (language && language !== 'text') {
        // 检查语言是否已加载
        if (!highlighterInfo.loadedLanguages.has(language as any)) {
          try {
            setIsLanguageLoaded(false)
            // 检查语言是否被 shiki 支持
            const supportedLangs = highlighterInfo.highlighter.getLoadedLanguages()
            const bundledLangs = await import('shiki').then(m => Object.keys(m.bundledLanguages || {}))
            const isSupported = supportedLangs.includes(language) || bundledLangs.includes(language)

            if (isSupported) {
              await highlighterInfo.highlighter.loadLanguage(language as any)
              // 更新 loadedLanguages set
              highlighterInfo.loadedLanguages.add(language as any)
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
    }

    loadLanguageIfNeeded()
  }, [highlighterInfo, language, shouldEnableHighlight, initHighlighter])

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copyCode = useCallback(async () => {
    if (!isClipboardAvailable()) return

    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // 复制失败静默处理
    }
  }, [code])

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  return (
    <div className="incremark-code">
      <div className="code-header">
        <span className="language">{language}</span>
        <button
          className="code-btn"
          onClick={copyCode}
          type="button"
          aria-label={copied ? t('code.copied') : t('code.copy')}
          title={copied ? 'Copied!' : 'Copy'}
        >
          <SvgIcon svg={copied ? LucideCopyCheck : LucideCopy} />
        </button>
      </div>
      <div className="code-content">
        <div className="shiki-wrapper">
          {/* Stream 高亮（只有当存在代码内容且语言加载完成后才渲染） */}
          {shouldEnableHighlight && highlighterInfo && isLanguageLoaded ? (
            <CachedCodeRenderer
              code={code}
              lang={language}
              theme={theme}
              highlighter={highlighterInfo.highlighter}
            />
          ) : (
            // 无高亮模式（禁用高亮、无代码内容、或语言未加载完成时显示）
            <pre className="code-fallback"><code>{code}</code></pre>
          )}
        </div>
      </div>
    </div>
  )
}
