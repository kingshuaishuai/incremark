import React, { useState, useEffect, useCallback } from 'react'
import type { Code } from 'mdast'
import { useShiki } from '../hooks/useShiki'

export interface IncremarkCodeDefaultProps {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 默认回退主题（当指定主题加载失败时使用），默认 github-dark */
  fallbackTheme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
}

export const IncremarkCodeDefault: React.FC<IncremarkCodeDefaultProps> = ({
  node,
  theme = 'github-dark',
  fallbackTheme = 'github-dark',
  disableHighlight = false
}) => {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')

  const language = node.lang || 'text'
  const code = node.value

  // 使用 Shiki 单例管理器
  const { isHighlighting, highlight } = useShiki(theme)

  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 复制失败静默处理
    }
  }, [code])

  const doHighlight = useCallback(async () => {
    if (!code || disableHighlight) {
      setHighlightedHtml('')
      return
    }

    try {
      const html = await highlight(code, language, fallbackTheme)
      setHighlightedHtml(html)
    } catch {
      // Shiki 不可用或加载失败
      setHighlightedHtml('')
    }
  }, [code, language, fallbackTheme, disableHighlight, highlight])

  useEffect(() => {
    doHighlight()
  }, [doHighlight])

  return (
    <div className="incremark-code">
      <div className="code-header">
        <span className="language">{language}</span>
        <button className="code-btn" onClick={copyCode} type="button">
          {copied ? '✓ 已复制' : '复制'}
        </button>
      </div>
      <div className="code-content">
        {isHighlighting && !highlightedHtml ? (
          <div className="code-loading">
            <pre><code>{code}</code></pre>
          </div>
        ) : highlightedHtml ? (
          <div className="shiki-wrapper" dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
        ) : (
          <pre className="code-fallback"><code>{code}</code></pre>
        )}
      </div>
    </div>
  )
}

