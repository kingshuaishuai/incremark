<!--
  CachedCodeRenderer - 使用 shiki-stream 实现流式代码高亮
  
  基于 shiki-stream 的设计模式，适配 Svelte 5：
  - 在脚本顶层创建和消费 stream（类似 Vue setup）
  - 使用 $state 存储 tokens
  - 使用 $effect 监听 code 变化
  - SSR 兼容：Web Streams API 只在浏览器中使用
-->
<script lang="ts">
  import type { ThemedToken } from '@shikijs/core'
  import { onDestroy, untrack } from 'svelte'
  import { CodeToTokenTransformStream } from 'shiki-stream'
  import { getTokenStyleObject } from '@shikijs/core'
  import { objectId } from '@antfu/utils'

  interface Props {
    code: string
    lang: string
    theme: string
    highlighter: any
  }

  let { code, lang, theme, highlighter }: Props = $props()

  // SSR 检测：Web Streams API 只在浏览器中可用
  const isBrowser = typeof window !== 'undefined'

  // Stream 错误状态
  let hasStreamError = $state(false)

  // Tokens 数组（与 Vue 的 reactive 数组对齐）
  let tokens = $state<ThemedToken[]>([])
  
  // 已处理的 code 长度
  let index = $state(0)

  // Stream 相关状态（只在浏览器中初始化）
  let controller: ReadableStreamController<string> | null = null
  let tokenStream: ReadableStream<any> | null = null

  // 只在浏览器环境中创建 stream
  if (isBrowser) {
    const textStream = new ReadableStream<string>({
      start(_controller) {
        controller = _controller
      }
    })

    try {
      const initialHighlighter = untrack(() => highlighter)
      const initialLang = untrack(() => lang)
      const initialTheme = untrack(() => theme)
      
      tokenStream = textStream.pipeThrough(
        new CodeToTokenTransformStream({
          highlighter: initialHighlighter,
          lang: initialLang,
          theme: initialTheme,
          allowRecalls: true
        })
      )
    } catch (error) {
      console.error('Failed to create token stream:', error)
      hasStreamError = true
    }

    // 消费 token stream
    if (tokenStream) {
      tokenStream.pipeTo(
        new WritableStream({
          write(token: any) {
            if ('recall' in token) {
              tokens.splice(tokens.length - token.recall, token.recall)
            } else {
              tokens.push(token)
            }
          }
        })
      ).catch((error) => {
        console.error('Stream error:', error)
        hasStreamError = true
      })
    }
  }

  // 监听 code 变化，增量推送到流中（与 Vue 的 watchEffect 对齐）
  $effect(() => {
    if (!isBrowser || hasStreamError || !controller) return

    // 读取 code 的值来建立依赖
    const currentCode = code
    
    // 使用 untrack 避免 index 建立依赖
    const currentIndex = untrack(() => index)

    // 只处理增量更新：传入新增的部分
    if (currentCode.length > currentIndex) {
      const incremental = currentCode.slice(currentIndex)
      controller.enqueue(incremental as any)
      index = currentCode.length
    }
  })

  // 组件卸载时清理
  onDestroy(() => {
    controller?.close()
  })
</script>

{#if hasStreamError || !isBrowser || tokens.length === 0}
  <!-- SSR 或错误时渲染原始代码 -->
  <pre class="shiki incremark-code-stream"><code>{code}</code></pre>
{:else}
  <!-- 正常渲染高亮代码（与 Vue/React 的渲染结构对齐） -->
  {@const getStyle = (token: any) => {
    const style = token.htmlStyle || getTokenStyleObject(token)
    // 如果是对象，转换为 CSS 字符串
    if (typeof style === 'object') {
      return Object.entries(style).map(([k, v]) => `${k}: ${v}`).join('; ')
    }
    return style
  }}
  <pre class="shiki incremark-code-stream"><code>{#each tokens as token (objectId(token))}<span style={getStyle(token)}>{token.content}</span>{/each}</code></pre>
{/if}
