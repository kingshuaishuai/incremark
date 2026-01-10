/* @jsxImportSource solid-js */

/**
 * CachedCodeRenderer - 使用 shiki-stream 实现流式代码高亮
 *
 * 基于 shiki-stream 的 SolidJS 实现，参考 Vue/React 版本
 *
 * 与 Vue/React 版本保持一致：
 * - 在组件初始化时创建 stream（不在 onMount 中）
 * - 直接消费 stream，不使用单独的 Renderer 组件
 * - hasStreamError 状态和错误处理
 * - class: 'shiki incremark-code-stream'
 */
import type { ThemedToken } from '@shikijs/core'
import { CodeToTokenTransformStream } from 'shiki-stream'
import { getTokenStyleObject } from '@shikijs/core'
import { createEffect, createSignal, on, onCleanup, onMount, For, Show } from 'solid-js'
import { batch } from 'solid-js'
import { Component } from 'solid-js'

export interface CachedCodeRendererProps {
  code: string
  lang: string
  theme: string
  highlighter: any
  onStreamStart?: () => void
  onStreamEnd?: () => void
  onStreamError?: () => void
}

// SSR 检测：Web Streams API 只在浏览器中可用
const isBrowser = typeof window !== 'undefined'

export const CachedCodeRenderer: Component<CachedCodeRendererProps> = (props) => {
  // Stream 错误状态
  const [hasStreamError, setHasStreamError] = createSignal(false)

  // Tokens 数组 - 使用 reactive 模式（与 Vue 一致）
  const [tokens, setTokens] = createSignal<ThemedToken[]>([])

  // Stream 相关状态（只在浏览器中初始化）
  const [index, setIndex] = createSignal(0)
  let controller: ReadableStreamController<string> | null = null
  let abortController: AbortController | null = null

  // 只在浏览器环境中创建 stream（在 onMount 中，确保只执行一次）
  // 这是与 Vue 版本的关键区别：Vue 的 setup 只执行一次，SolidJS 组件函数可能执行多次
  // 所以使用 onMount 来确保 stream 只创建一次
  onMount(() => {
    if (!isBrowser) return

    const textStream = new ReadableStream<string>({
      start(_controller) {
        controller = _controller
      },
    })

    try {
      const tokenStream = textStream.pipeThrough(
        new CodeToTokenTransformStream({
          highlighter: props.highlighter,
          lang: props.lang,
          theme: props.theme,
          allowRecalls: true,
        })
      )

      // 消费 stream（与 Vue 版本对齐，直接消费）
      let started = false

      abortController = new AbortController()

      tokenStream.pipeTo(new WritableStream({
        write(token) {
          if (abortController?.signal.aborted) return

          if (!started) {
            started = true
            props.onStreamStart?.()
          }

          batch(() => {
            if ('recall' in token) {
              // 处理 recall：删除最后 N 个 tokens
              setTokens(ts => ts.slice(0, -token.recall))
            } else {
              // 添加新 token
              setTokens(ts => [...ts, token])
            }
          })
        },
        close: () => {
          if (!abortController?.signal.aborted) {
            props.onStreamEnd?.()
          }
        },
        abort: () => {
          if (!abortController?.signal.aborted) {
            props.onStreamEnd?.()
          }
        },
      }), { signal: abortController.signal }).catch((error) => {
        // Ignore abort errors (normal cleanup)
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        // 静默处理不支持的语言错误（不打印到 console）
        if (error instanceof Error && error.message.includes('not found')) {
          setHasStreamError(true)
          return
        }
        console.error('Stream error:', error)
        setHasStreamError(true)
      })
    } catch (error) {
      // 静默处理不支持的语言错误（不打印到 console）
      if (error instanceof Error && error.message.includes('not found')) {
        setHasStreamError(true)
        return
      }
      console.error('Failed to create token stream:', error)
      setHasStreamError(true)
    }
  })

  // 监听 code 变化，增量推送到流中（使用 on 进行精确追踪）
  createEffect(on(
    () => props.code,
    (newCode) => {
      if (!isBrowser || !controller || abortController?.signal.aborted) return

      // 只处理增量更新：传入新增的部分
      const currentIndex = index()
      if (newCode.length > currentIndex && !hasStreamError()) {
        const incremental = newCode.slice(currentIndex)
        controller.enqueue(incremental as any)
        setIndex(newCode.length)
      }
    },
  ))

  // 组件卸载时清理
  onCleanup(() => {
    abortController?.abort()
    controller = null
    setHasStreamError(false)
    setTokens([])
    setIndex(0)
  })

  // 渲染（与 Vue/React 版本对齐）
  return (
    <Show
      when={!(hasStreamError() || !isBrowser || tokens().length === 0)}
      fallback={
        // SSR 或错误时渲染原始代码
        <pre class="shiki incremark-code-stream">
          <code>{props.code}</code>
        </pre>
      }
    >
      {/* 正常渲染高亮代码 */}
      <pre class="shiki incremark-code-stream">
        <code>
          <For each={tokens()}>
            {(token) => (
              <span style={token.htmlStyle ?? getTokenStyleObject(token)}>
                {token.content}
              </span>
            )}
          </For>
        </code>
      </pre>
    </Show>
  )
}
