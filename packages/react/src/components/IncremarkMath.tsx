import React, { useState, useEffect, useRef, useCallback } from 'react'

interface MathNode {
  type: 'math' | 'inlineMath'
  value: string
  data?: {
    hName?: string
    hProperties?: Record<string, any>
  }
}

export interface IncremarkMathProps {
  node: MathNode
  /** 渲染延迟（毫秒），用于流式输入时防抖 */
  renderDelay?: number
}

export const IncremarkMath: React.FC<IncremarkMathProps> = ({
  node,
  renderDelay = 300
}) => {
  const [renderedHtml, setRenderedHtml] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const katexRef = useRef<any>(null)
  const renderTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  
  const isInline = node.type === 'inlineMath'
  const formula = node.value
  
  const doRender = useCallback(async () => {
    if (!formula) return
    
    try {
      if (!katexRef.current) {
        const katexModule = await import('katex')
        katexRef.current = katexModule.default
      }
      
      const katex = katexRef.current
      const html = katex.renderToString(formula, {
        displayMode: !isInline,
        throwOnError: false,
        strict: false
      })
      setRenderedHtml(html)
    } catch {
      setRenderedHtml('')
    } finally {
      setIsLoading(false)
    }
  }, [formula, isInline])
  
  const scheduleRender = useCallback(() => {
    if (!formula) {
      setRenderedHtml('')
      return
    }
    
    if (renderTimerRef.current) {
      clearTimeout(renderTimerRef.current)
    }
    
    setIsLoading(true)
    renderTimerRef.current = setTimeout(() => {
      doRender()
    }, renderDelay)
  }, [formula, renderDelay, doRender])
  
  useEffect(() => {
    scheduleRender()
  }, [scheduleRender])
  
  useEffect(() => {
    return () => {
      if (renderTimerRef.current) {
        clearTimeout(renderTimerRef.current)
      }
    }
  }, [])
  
  if (isInline) {
    return (
      <span className="incremark-math-inline">
        {renderedHtml && !isLoading ? (
          <span dangerouslySetInnerHTML={{ __html: renderedHtml }} />
        ) : (
          <code className="math-source">{formula}</code>
        )}
      </span>
    )
  }
  
  return (
    <div className="incremark-math-block">
      {renderedHtml && !isLoading ? (
        <div className="math-rendered" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
      ) : (
        <pre className="math-source-block"><code>{formula}</code></pre>
      )}
    </div>
  )
}

