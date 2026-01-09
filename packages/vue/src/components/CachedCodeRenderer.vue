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

// Stream 错误状态
const hasStreamError = ref(false)

// 完全照搬 ShikiCachedRenderer 的实现
const index = ref(0)
let controller: ReadableStreamController<string> | null = null
const textStream = new ReadableStream<string>({
  start(_controller) {
    controller = _controller
  },
})

watch(() => props.code, (newCode) => {
  // 只处理增量更新：传入新增的部分
  if (newCode.length > index.value && !hasStreamError.value) {
    const incremental = newCode.slice(index.value)
    controller?.enqueue(incremental as any)
    index.value = newCode.length
  }
}, { immediate: true })

// 尝试创建 token stream，如果失败则标记错误
let tokenStream: ReadableStream<any> | null = null

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

// 直接消费 stream，不用 watch
const tokens = reactive<any[]>([])

if (tokenStream) {
  let tokenCount = 0
  tokenStream.pipeTo(new WritableStream({
    write(token) {
      const start = performance.now()
      if ('recall' in token)
        tokens.splice(tokens.length - token.recall, token.recall)
      else
        tokens.push(token)
      const elapsed = performance.now() - start
      tokenCount++
      if (elapsed > 1) {
        console.log(`[Vue CodeRenderer] Token #${tokenCount} update took ${elapsed.toFixed(2)}ms, total tokens: ${tokens.length}`)
      }
    },
    close: () => {
      console.log(`[Vue CodeRenderer] Stream completed, total tokens: ${tokenCount}`)
      emit('stream-end')
    },
  })).catch((error) => {
    console.error('Stream error:', error)
    hasStreamError.value = true
    emit('stream-error')
  })
}

// 渲染函数
const render = () => {
  // 如果有错误，渲染纯文本
  if (hasStreamError.value) {
    return h('pre', { class: 'shiki incremark-code-stream' }, h('code', props.code))
  }

  // 正常渲染高亮代码
  return h(
    'pre',
    { class: 'shiki incremark-code-stream' },
    h(
      'code',
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
