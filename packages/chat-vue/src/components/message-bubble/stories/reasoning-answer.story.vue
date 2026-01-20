<script setup lang="ts">
/**
 * 思考 + 回答演示
 */
import { ref, onMounted } from 'vue'
import MessageBubble from '../message-bubble.vue'
import TextMessage from '../../text-message/text-message.vue'
import ReasoningMessage from '../../reasoning-message/reasoning-message.vue'
import { ChainOfThought } from '../../chain-of-thought'

const phase = ref<'reasoning' | 'answering' | 'done'>('reasoning')
const reasoningContent = ref('')
const answerContent = ref('')
const startTime = ref(Date.now())
const endTime = ref<number | undefined>(undefined)
const expanded = ref(true)

const fullReasoning = `用户询问 async/await 的工作原理。我需要：
1. 解释 Promise 的基础概念
2. 说明 async 函数的返回值
3. 解释 await 的暂停机制
4. 给出实际代码示例`

const fullAnswer = `## Async/Await 工作原理

\`async/await\` 是 JavaScript 处理异步操作的语法糖。

### async 函数

\`async\` 关键字使函数返回一个 Promise：

\`\`\`javascript
async function fetchData() {
  return 'data'; // 自动包装为 Promise.resolve('data')
}
\`\`\`

### await 表达式

\`await\` 暂停执行直到 Promise 完成：

\`\`\`javascript
async function getData() {
  const response = await fetch('/api/data');
  const data = await response.json();
  return data;
}
\`\`\``

function simulate(text: string, onChunk: (s: string) => void, onDone: () => void, speed = 20) {
  let i = 0
  const interval = setInterval(() => {
    if (i < text.length) {
      onChunk(text.slice(0, ++i))
    } else {
      clearInterval(interval)
      onDone()
    }
  }, speed)
}

function start() {
  phase.value = 'reasoning'
  reasoningContent.value = ''
  answerContent.value = ''
  startTime.value = Date.now()
  endTime.value = undefined
  expanded.value = true

  simulate(fullReasoning, (s) => (reasoningContent.value = s), () => {
    // 思考结束，记录时间并折叠
    endTime.value = Date.now()
    expanded.value = false
    phase.value = 'answering'
    setTimeout(() => {
      simulate(fullAnswer, (s) => (answerContent.value = s), () => (phase.value = 'done'))
    }, 300)
  }, 15)
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
        <ChainOfThought
          v-model:expanded="expanded"
          title="思考中"
          :loading="phase === 'reasoning'"
          :start-time="startTime"
          :end-time="endTime"
        >
          <ReasoningMessage
            :content="reasoningContent"
            :streaming="phase === 'reasoning'"
          />
        </ChainOfThought>
        <TextMessage
          v-if="phase !== 'reasoning'"
          :part="{ type: 'text', content: answerContent, format: 'markdown' }"
          :streaming="phase === 'answering'"
        />
      </div>
    </MessageBubble>
  </div>
</template>
