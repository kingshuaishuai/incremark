<script setup lang="ts">
import { h, ref, reactive, watch, renderList, onMounted, onUnmounted } from 'vue'
import { CodeToTokenTransformStream } from 'shiki-stream'
import { getTokenStyleObject } from '@shikijs/core'
import { objectId } from '@antfu/utils'

interface Props {
  code: string
  lang: string
  theme: string
  highlighter: any
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'stream-start': []
  'stream-end': []
  'stream-error': []
}>()

// SSR 检测：Web Streams API 只在浏览器中可用
const isBrowser = typeof window !== 'undefined'

// Stream 错误状态
const hasStreamError = ref(false)

// Tokens 数组
const tokens = reactive<any[]>([])

// Stream 相关状态（只在浏览器中初始化）
const index = ref(0)
let controller: ReadableStreamController<string> | null = null
let textStream: ReadableStream<string> | null = null
let tokenStream: ReadableStream<any> | null = null

// 只在浏览器环境中创建 stream
if (isBrowser) {
  textStream = new ReadableStream<string>({
    start(_controller) {
      controller = _controller
    },
  })

  try {
    tokenStream = textStream.pipeThrough(
      new CodeToTokenTransformStream({
        highlighter: props.highlighter,
        lang: props.lang,
        theme: props.theme,
        allowRecalls: true,
      })
    )
  } catch (error) {
    console.error('Failed to create token stream:', error)
    hasStreamError.value = true
    emit('stream-error')
  }

  // 消费 stream
  if (tokenStream) {
    tokenStream.pipeTo(new WritableStream({
      write(token) {
        if ('recall' in token)
          tokens.splice(tokens.length - token.recall, token.recall)
        else
          tokens.push(token)
      },
      close: () => {
        emit('stream-end')
      },
    })).catch((error) => {
      console.error('Stream error:', error)
      hasStreamError.value = true
      emit('stream-error')
    })
  }
}

// 监听 code 变化，增量推送到流中
watch(() => props.code, (newCode) => {
  if (!isBrowser || !controller) return
  
  // 只处理增量更新：传入新增的部分
  if (newCode.length > index.value && !hasStreamError.value) {
    const incremental = newCode.slice(index.value)
    controller.enqueue(incremental as any)
    index.value = newCode.length
  }
}, { immediate: true })

// 渲染函数
const render = () => {
  // SSR 或错误时渲染原始代码
  if (hasStreamError.value || !isBrowser || tokens.length === 0) {
    return h('pre', { class: 'shiki incremark-code-stream' }, h('code', {}, props.code))
  }

  // 正常渲染高亮代码
  return h(
    'pre',
    { class: 'shiki incremark-code-stream' },
    h(
      'code',
      {},
      renderList(tokens, (token: any) => h('span', { key: objectId(token), style: token.htmlStyle || getTokenStyleObject(token) }, token.content)),
    ),
  )
}

// 组件卸载时清理
onUnmounted(() => {
  hasStreamError.value = false
  tokens.length = 0
  index.value = 0
})
</script>

<template>
  <component :is="render" />
</template>
