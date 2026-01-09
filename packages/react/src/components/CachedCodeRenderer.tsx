/**
 * CachedCodeRenderer - 使用 shiki-stream 实现流式代码高亮
 *
 * 基于 shiki-stream 的实现，参考 Vue 版本 CachedCodeRenderer.vue
 * 
 * 与 Vue 版本保持一致：
 * - 在组件初始化时创建 stream（不在 useEffect 中）
 * - 直接消费 stream，不使用单独的 Renderer 组件
 * - hasStreamError 状态和错误处理
 * - class: 'shiki incremark-code-stream'
 */
import type { ThemedToken } from '@shikijs/core'
import { objectId } from '@antfu/utils'
import { getTokenStyleObject } from '@shikijs/core'
import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react'
import { CodeToTokenTransformStream } from 'shiki-stream'

export interface CachedCodeRendererProps {
  code: string
  lang: string
  theme: string
  highlighter: any
  onStreamStart?: () => void
  onStreamEnd?: () => void
  onStreamError?: () => void
}

export interface CachedCodeRendererRef {
  reset: () => void
}

/**
 * CachedCodeRenderer - 参考 Vue 版本实现
 *
 * 期望 code prop 只会增量更新，不会被设置为新值。
 * 如果需要设置新值，请在发生时设置不同的 key prop。
 */
export const CachedCodeRenderer = forwardRef<CachedCodeRendererRef, CachedCodeRendererProps>(
  function CachedCodeRenderer({ code, lang, theme, highlighter, onStreamStart, onStreamEnd, onStreamError }, ref) {
    const [hasStreamError, setHasStreamError] = useState(false)
    const [tokens, setTokens] = useState<ThemedToken[]>([])
    
    // 使用 ref 存储 stream 相关状态（与 Vue 版本的模块级变量对应）
    const streamRef = useRef<{
      controller: ReadableStreamController<string> | null
      index: number
      initialized: boolean
      streamConsumed: boolean
    }>({
      controller: null,
      index: 0,
      initialized: false,
      streamConsumed: false
    })

    // 暴露 ref 方法
    useImperativeHandle(ref, () => ({
      reset: () => {
        setHasStreamError(false)
        setTokens([])
        streamRef.current.index = 0
      }
    }))

    // 初始化并消费 stream（只执行一次，与 Vue 版本的 setup 对齐）
    useEffect(() => {
      // 防止 React 严格模式下重复执行
      if (streamRef.current.initialized) return
      streamRef.current.initialized = true

      // 创建文本流（与 Vue 版本对齐）
      const textStream = new ReadableStream<string>({
        start(controller) {
          streamRef.current.controller = controller
        },
      })

      let tokenStream: ReadableStream<any> | null = null

      try {
        tokenStream = textStream.pipeThrough(
          new CodeToTokenTransformStream({
            highlighter,
            lang,
            theme,
            allowRecalls: true,
          })
        )
      } catch (error) {
        console.error('Failed to create token stream:', error)
        setHasStreamError(true)
        onStreamError?.()
        return
      }

      // 直接消费 stream（与 Vue 版本对齐，不使用单独的 Renderer）
      let started = false
      let tokenCount = 0

      tokenStream.pipeTo(new WritableStream({
        write(token) {
          if (!started) {
            started = true
            onStreamStart?.()
          }
          if ('recall' in token) {
            setTokens(prev => {
              const newTokens = [...prev]
              newTokens.splice(newTokens.length - token.recall, token.recall)
              return newTokens
            })
          } else {
            setTokens(prev => [...prev, token])
          }
          tokenCount++
        },
        close: () => {
          console.log(`[React CodeRenderer] Stream completed, total tokens: ${tokenCount}`)
          onStreamEnd?.()
        },
      })).catch((error) => {
        console.error('Stream error:', error)
        setHasStreamError(true)
        onStreamError?.()
      })

      streamRef.current.streamConsumed = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // 空依赖，只执行一次

    // 监听 code 变化，增量推送到流中（与 Vue 版本的 watch 对齐）
    useEffect(() => {
      const { controller, index } = streamRef.current
      if (!controller || hasStreamError) return

      if (code.length > index) {
        const incremental = code.slice(index)
        try {
          controller.enqueue(incremental as any)
          streamRef.current.index = code.length
        } catch {
          // Stream 已关闭，忽略错误
        }
      }
    }, [code, hasStreamError])

    // 渲染（与 Vue 版本对齐）
    if (hasStreamError) {
      return (
        <pre className="shiki incremark-code-stream">
          <code>{code}</code>
        </pre>
      )
    }

    return (
      <pre className="shiki incremark-code-stream">
        <code>
          {tokens.map((token) => {
            // 获取样式
            const styleObj: unknown = token.htmlStyle || getTokenStyleObject(token)
            // React 需要 camelCase 样式属性
            const reactStyle: React.CSSProperties = {}
            if (typeof styleObj === 'string') {
              // 解析字符串样式
              styleObj.split(';').forEach((rule: string) => {
                const colonIndex = rule.indexOf(':')
                if (colonIndex > 0) {
                  const key = rule.slice(0, colonIndex).trim()
                  const value = rule.slice(colonIndex + 1).trim()
                  if (key && value) {
                    const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                    ;(reactStyle as any)[camelKey] = value
                  }
                }
              })
            } else if (styleObj && typeof styleObj === 'object') {
              for (const [key, value] of Object.entries(styleObj as Record<string, unknown>)) {
                const camelKey = key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                ;(reactStyle as any)[camelKey] = value
              }
            }

            return (
              <span key={objectId(token)} style={reactStyle}>
                {token.content}
              </span>
            )
          })}
        </code>
      </pre>
    )
  }
)
