<script setup lang="ts">
/**
 * 工具调用 + 回答演示
 */
import { ref, onMounted } from 'vue'
import MessageBubble from '../message-bubble.vue'
import TextMessage from '../../text-message/text-message.vue'
import ToolCall from '../../tool-call/tool-call.vue'

const phase = ref<'calling' | 'executing' | 'answering' | 'done'>('calling')
const toolState = ref('input-available')
const toolOutput = ref<unknown>(null)
const answerContent = ref('')

const searchResult = {
  results: [
    { title: 'React Documentation', url: 'https://react.dev' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org' }
  ]
}

const fullAnswer = `根据搜索结果，以下是 React Hooks 的官方资源：

1. **React 官方文档** - [react.dev](https://react.dev)
   - 最权威的 Hooks 教程和 API 参考

2. **MDN Web Docs** - [developer.mozilla.org](https://developer.mozilla.org)
   - JavaScript 基础知识补充`

function simulate(text: string, onChunk: (s: string) => void, onDone: () => void) {
  let i = 0
  const interval = setInterval(() => {
    if (i < text.length) {
      onChunk(text.slice(0, ++i))
    } else {
      clearInterval(interval)
      onDone()
    }
  }, 20)
}

function start() {
  phase.value = 'calling'
  toolState.value = 'input-available'
  toolOutput.value = null
  answerContent.value = ''

  setTimeout(() => {
    phase.value = 'executing'
    toolState.value = 'executing'
  }, 800)

  setTimeout(() => {
    toolState.value = 'output-available'
    toolOutput.value = searchResult
    phase.value = 'answering'

    setTimeout(() => {
      simulate(fullAnswer, (s) => (answerContent.value = s), () => (phase.value = 'done'))
    }, 300)
  }, 2000)
}

onMounted(() => start())
</script>

<template>
  <div>
    <button :disabled="phase !== 'done'" style="margin-bottom: 12px;" @click="start">
      重新播放
    </button>
    <MessageBubble placement="start" variant="borderless" style="max-width: 600px;">
      <template #avatar>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          AI
        </div>
      </template>
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <ToolCall
          :part="{
            type: 'tool-call',
            toolCallId: 'call_123',
            toolName: 'web_search',
            args: { query: 'React Hooks 教程' },
            state: toolState,
            output: toolOutput
          }"
        />
        <TextMessage
          v-if="phase === 'answering' || phase === 'done'"
          :part="{ type: 'text', content: answerContent, format: 'markdown' }"
          :streaming="phase === 'answering'"
        />
      </div>
    </MessageBubble>
  </div>
</template>
