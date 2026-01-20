<script setup lang="ts">
/**
 * 流式 Markdown 输出演示
 */
import { ref, onMounted } from 'vue'
import MessageBubble from '../message-bubble.vue'
import TextMessage from '../../text-message/text-message.vue'

const content = ref('')
const streaming = ref(true)

const fullContent = `## React Hooks 最佳实践

React Hooks 是 React 16.8 引入的特性，让你在函数组件中使用状态和其他 React 特性。

### 常用 Hooks

1. **useState** - 状态管理
2. **useEffect** - 副作用处理
3. **useCallback** - 函数缓存
4. **useMemo** - 值缓存

\`\`\`typescript
const [count, setCount] = useState(0);

useEffect(() => {
  document.title = \`Count: \${count}\`;
}, [count]);
\`\`\`

> 记住：只在顶层调用 Hooks，不要在循环或条件中调用。`

function simulateStreaming() {
  content.value = ''
  streaming.value = true
  let index = 0
  const interval = setInterval(() => {
    if (index < fullContent.length) {
      content.value = fullContent.slice(0, ++index)
    } else {
      clearInterval(interval)
      streaming.value = false
    }
  }, 10)
}

onMounted(() => simulateStreaming())
</script>

<template>
  <div>
    <button :disabled="streaming" style="margin-bottom: 12px;" @click="simulateStreaming">
      重新播放
    </button>
    <MessageBubble placement="start" variant="borderless" style="max-width: 600px;">
      <template #avatar>
        <div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">
          AI
        </div>
      </template>
      <TextMessage
        :part="{ type: 'text', content, format: 'markdown' }"
        :streaming="streaming"
      />
    </MessageBubble>
  </div>
</template>
