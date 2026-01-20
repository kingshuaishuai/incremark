<script setup lang="ts">
/**
 * 完整多轮对话演示
 */
import MessageBubble from '../message-bubble.vue'
import TextMessage from '../../text-message/text-message.vue'
import ReasoningMessage from '../../reasoning-message/reasoning-message.vue'
import ToolCall from '../../tool-call/tool-call.vue'
import { ChainOfThought } from '../../chain-of-thought'
import type { ChatMessage } from '@incremark/chat-core'

const messages: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    parts: [{ type: 'text', content: '帮我搜索一下 Vue 3 Composition API 的最佳实践', format: 'markdown' }],
    status: 'success',
    createdAt: Date.now() - 60000
  },
  {
    id: '2',
    role: 'assistant',
    parts: [
      {
        type: 'tool-call',
        toolCallId: 'call_456',
        toolName: 'web_search',
        args: { query: 'Vue 3 Composition API best practices' },
        state: 'output-available',
        output: { results: [{ title: 'Vue.js Docs', url: 'https://vuejs.org' }] }
      },
      {
        type: 'text',
        content: `## Vue 3 Composition API 最佳实践

### 1. 使用 \`<script setup>\`

这是最简洁的写法：

\`\`\`vue
<` + `script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</` + `script>
\`\`\`

### 2. 提取可复用逻辑到 Composables

\`\`\`typescript
// useCounter.ts
export function useCounter(initial = 0) {
  const count = ref(initial)
  const increment = () => count.value++
  return { count, increment }
}
\`\`\``,
        format: 'markdown'
      }
    ],
    status: 'success',
    createdAt: Date.now() - 30000
  },
  {
    id: '3',
    role: 'user',
    parts: [{ type: 'text', content: 'Composables 和 React Hooks 有什么区别？', format: 'markdown' }],
    status: 'success',
    createdAt: Date.now() - 10000
  },
  {
    id: '4',
    role: 'assistant',
    parts: [
      {
        type: 'reasoning',
        content: '用户想了解 Vue Composables 和 React Hooks 的区别。我需要从响应式系统、调用规则、生命周期等方面进行对比。',
        status: 'completed'
      },
      {
        type: 'text',
        content: `## Composables vs React Hooks

| 特性 | Vue Composables | React Hooks |
|------|-----------------|-------------|
| 响应式 | 基于 Proxy | 基于闭包 |
| 调用规则 | 无限制 | 必须顶层调用 |
| 条件调用 | ✅ 支持 | ❌ 不支持 |

### 核心区别

Vue 的响应式是**基于引用**的，而 React 是**基于快照**的。`,
        format: 'markdown'
      }
    ],
    status: 'success',
    createdAt: Date.now()
  }
]
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px; max-width: 700px;">
    <template v-for="msg in messages" :key="msg.id">
      <MessageBubble
        :placement="msg.role === 'user' ? 'end' : 'start'"
        :variant="msg.role === 'user' ? 'filled' : 'borderless'"
      >
        <template v-if="msg.role === 'assistant'" #avatar>
          <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
            AI
          </div>
        </template>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <template v-for="(part, idx) in msg.parts" :key="idx">
            <ChainOfThought
              v-if="part.type === 'reasoning'"
              title="思考过程"
            >
              <ReasoningMessage
                :content="part.content"
                :streaming="false"
              />
            </ChainOfThought>
            <ToolCall
              v-else-if="part.type === 'tool-call'"
              :part="part"
            />
            <TextMessage
              v-else-if="part.type === 'text'"
              :part="part"
              :streaming="false"
            />
          </template>
        </div>
      </MessageBubble>
    </template>
  </div>
</template>
