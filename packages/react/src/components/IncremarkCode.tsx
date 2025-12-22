import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Code } from 'mdast'

export interface IncremarkCodeProps {
  node: Code
  /** Shiki 主题，默认 github-dark */
  theme?: string
  /** 是否禁用代码高亮 */
  disableHighlight?: boolean
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
}

export const IncremarkCode: React.FC<IncremarkCodeProps> = ({
  node,
  theme = 'github-dark',
  disableHighlight = false,
  mermaidDelay = 500
}) => {
  const [copied, setCopied] = useState(false)
  const [highlightedHtml, setHighlightedHtml] = useState('')
  const [isHighlighting, setIsHighlighting] = useState(false)
  const [mermaidSvg, setMermaidSvg] = useState('')
  const [mermaidLoading, setMermaidLoading] = useState(false)
  const [mermaidViewMode, setMermaidViewMode] = useState<'preview' | 'source'>('preview')
  
  const mermaidRef = useRef<any>(null)
  const highlighterRef = useRef<any>(null)
  const mermaidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const loadedLanguagesRef = useRef<Set<string>>(new Set())
  const loadedThemesRef = useRef<Set<string>>(new Set())
  
  const language = node.lang || 'text'
  const code = node.value
  const isMermaid = language === 'mermaid'
  
  const toggleMermaidView = useCallback(() => {
    setMermaidViewMode(prev => prev === 'preview' ? 'source' : 'preview')
  }, [])
  
  const copyCode = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // 复制失败静默处理
    }
  }, [code])
  
  const doRenderMermaid = useCallback(async () => {
    if (!code) return
    
    try {
      if (!mermaidRef.current) {
        const mermaidModule = await import('mermaid')
        mermaidRef.current = mermaidModule.default
        mermaidRef.current.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose'
        })
      }
      
      const mermaid = mermaidRef.current
      const id = `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`
      const { svg } = await mermaid.render(id, code)
      setMermaidSvg(svg)
    } catch {
      setMermaidSvg('')
    } finally {
      setMermaidLoading(false)
    }
  }, [code])
  
  const scheduleRenderMermaid = useCallback(() => {
    if (!isMermaid || !code) return
    
    if (mermaidTimerRef.current) {
      clearTimeout(mermaidTimerRef.current)
    }
    
    setMermaidLoading(true)
    mermaidTimerRef.current = setTimeout(() => {
      doRenderMermaid()
    }, mermaidDelay)
  }, [isMermaid, code, mermaidDelay, doRenderMermaid])
  
  const highlight = useCallback(async () => {
    if (isMermaid) {
      scheduleRenderMermaid()
      return
    }
    
    if (!code || disableHighlight) {
      setHighlightedHtml('')
      return
    }
    
    setIsHighlighting(true)
    
    try {
      if (!highlighterRef.current) {
        const { createHighlighter } = await import('shiki')
        highlighterRef.current = await createHighlighter({
          themes: [theme as any],
          langs: []
        })
        loadedThemesRef.current.add(theme)
      }
      
      const highlighter = highlighterRef.current
      const lang = language
      
      if (!loadedLanguagesRef.current.has(lang) && lang !== 'text') {
        try {
          await highlighter.loadLanguage(lang)
          loadedLanguagesRef.current.add(lang)
        } catch {
          // 语言不支持
        }
      }
      
      if (!loadedThemesRef.current.has(theme)) {
        try {
          await highlighter.loadTheme(theme)
          loadedThemesRef.current.add(theme)
        } catch {
          // 主题不支持
        }
      }
      
      const html = highlighter.codeToHtml(code, {
        lang: loadedLanguagesRef.current.has(lang) ? lang : 'text',
        theme: loadedThemesRef.current.has(theme) ? theme : 'github-dark'
      })
      setHighlightedHtml(html)
    } catch {
      setHighlightedHtml('')
    } finally {
      setIsHighlighting(false)
    }
  }, [code, language, theme, disableHighlight, isMermaid, scheduleRenderMermaid])
  
  useEffect(() => {
    highlight()
  }, [highlight])
  
  useEffect(() => {
    return () => {
      if (mermaidTimerRef.current) {
        clearTimeout(mermaidTimerRef.current)
      }
    }
  }, [])
  
  if (isMermaid) {
    return (
      <div className="incremark-mermaid">
        <div className="mermaid-header">
          <span className="language">MERMAID</span>
          <div className="mermaid-actions">
            <button 
              className="code-btn" 
              onClick={toggleMermaidView} 
              type="button"
              disabled={!mermaidSvg}
            >
              {mermaidViewMode === 'preview' ? '源码' : '预览'}
            </button>
            <button className="code-btn" onClick={copyCode} type="button">
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>
        <div className="mermaid-content">
          {mermaidLoading && !mermaidSvg ? (
            <div className="mermaid-loading">
              <pre className="mermaid-source-code">{code}</pre>
            </div>
          ) : mermaidViewMode === 'source' ? (
            <pre className="mermaid-source-code">{code}</pre>
          ) : mermaidSvg ? (
            <div className="mermaid-svg" dangerouslySetInnerHTML={{ __html: mermaidSvg }} />
          ) : (
            <pre className="mermaid-source-code">{code}</pre>
          )}
        </div>
      </div>
    )
  }
  
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

