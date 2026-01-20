<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ReasoningMessage from '../reasoning-message.vue';

const content = ref('');
const streaming = ref(true);

const fullText = `## 问题分析

用户需要实现一个**聊天 UI 组件**，需要考虑以下方面：

1. **组件拆分** - 按照单一职责原则
2. **类型安全** - 完整的 TypeScript 支持
3. **流式渲染** - 支持 LLM 流式输出

## 解决方案

采用 **Parts-based 架构**：

\`\`\`typescript
type MessagePart = TextPart | ToolCallPart | ReasoningPart;
\`\`\`

这样可以在流式渲染过程中逐步展示 AI 的思考过程。`;

let index = 0;
let timer: number;

onMounted(() => {
  timer = window.setInterval(() => {
    if (index < fullText.length) {
      content.value = fullText.slice(0, ++index);
    } else {
      streaming.value = false;
      clearInterval(timer);
    }
  }, 30);
});

onUnmounted(() => clearInterval(timer));
</script>

<template>
  <div>
    <p style="margin-bottom: 12px; color: #666; font-size: 12px;">
      流式渲染演示：{{ streaming ? '输出中...' : '完成' }} ({{ content.length }}/{{ fullText.length }} 字符)
    </p>
    <ReasoningMessage
      :content="content"
      :streaming="streaming"
    />
  </div>
</template>
