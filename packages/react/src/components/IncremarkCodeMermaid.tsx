import React, { useState, useEffect, useRef, useCallback } from 'react'
import type { Code } from 'mdast'

export interface IncremarkCodeMermaidProps {
  node: Code
  /** Mermaid 渲染延迟（毫秒），用于流式输入时防抖 */
  mermaidDelay?: number
}

export const IncremarkCodeMermaid: React.FC<IncremarkCodeMermaidProps> = ({
  node,
  mermaidDelay = 500
}) => {
  const [copied, setCopied] = useState(false)
  const [mermaidSvg, setMermaidSvg] = useState('')
  const [mermaidLoading, setMermaidLoading] = useState(false)
  const [mermaidViewMode, setMermaidViewMode] = useState<'preview' | 'source'>('preview')

  const mermaidRef = useRef<any>(null)
  const mermaidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const code = node.value

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
          securityLevel: 'loose',
          suppressErrorRendering: true
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
    if (!code) return

    if (mermaidTimerRef.current) {
      clearTimeout(mermaidTimerRef.current)
    }

    setMermaidLoading(true)
    mermaidTimerRef.current = setTimeout(() => {
      doRenderMermaid()
    }, mermaidDelay)
  }, [code, mermaidDelay, doRenderMermaid])

  useEffect(() => {
    scheduleRenderMermaid()
  }, [scheduleRenderMermaid])

  useEffect(() => {
    return () => {
      if (mermaidTimerRef.current) {
        clearTimeout(mermaidTimerRef.current)
      }
    }
  }, [])

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

