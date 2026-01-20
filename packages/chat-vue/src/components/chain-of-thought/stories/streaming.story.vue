<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';
import { IncremarkContent } from '@incremark/vue';

const expanded = ref(true);
const startTime = ref(Date.now());

// 步骤数据 - 只有当步骤开始时才添加到数组
const steps = ref<Array<{
  type: 'search' | 'thinking' | 'execute' | 'complete';
  status: 'active' | 'complete';
  label?: string;
  query?: string;
  results?: number;
  content?: string;
}>>([]);

const fullThinkingText = `## 问题分析

用户想要实现一个聊天 UI 组件库，需要考虑以下几个方面：

1. **组件架构设计**
   - 采用 Parts 模式，支持多种消息类型
   - 使用容器+壳子的设计模式
   - 确保组件的可扩展性

2. **技术选型**
   - Vue 3 Composition API
   - TypeScript 类型安全
   - Incremark 增量渲染

3. **样式系统**
   - BEM 命名规范
   - Less 变量系统
   - 主题化支持`;

const isLoading = computed(() => {
  const lastStep = steps.value[steps.value.length - 1];
  return !lastStep || lastStep.type !== 'complete';
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function simulateStreaming() {
  if (steps.value.length > 0) {
    steps.value = [];
  }
  await sleep(500);

  // Step 1: 搜索开始
  steps.value.push({
    type: 'search',
    status: 'active',
    label: '搜索资料',
    query: 'Vue 3 chat UI components'
  });
  await sleep(1500);

  // Step 1: 搜索完成
  steps.value[0].status = 'complete';
  steps.value[0].results = 15;

  // Step 2: 思考开始
  steps.value.push({
    type: 'thinking',
    status: 'active',
    label: '分析思考',
    content: ''
  });

  // 流式输出思考内容
  for (let i = 0; i < fullThinkingText.length; i += 3) {
    steps.value[1].content = fullThinkingText.slice(0, i + 3);
    await sleep(30);
  }

  // Step 2: 思考完成
  steps.value[1].status = 'complete';

  // Step 3: 执行开始
  steps.value.push({
    type: 'execute',
    status: 'active',
    label: '执行操作'
  });
  await sleep(1000);

  // Step 3: 执行完成
  steps.value[2].status = 'complete';

  // Step 4: 完成
  steps.value.push({
    type: 'complete',
    status: 'complete',
    label: '任务完成'
  });
}

onMounted(() => {
  simulateStreaming();
});
</script>

<template>
  <div style="margin: 10px 0;">
    <button :disabled="isLoading" @click="simulateStreaming">reset</button>
  </div>
  <ChainOfThought
    v-model:expanded="expanded"
    title="思考过程"
    :loading="isLoading"
    :start-time="startTime"
  >
    <template v-for="(step, index) in steps" :key="index">
      <!-- 搜索步骤 -->
      <ChainOfThoughtStep
        v-if="step.type === 'search'"
        :label="step.label"
        :status="step.status"
        :show-divider="index < steps.length - 1"
      >
        <template #icon>
          <Icon icon="ph:magnifying-glass" width="14" height="14" />
        </template>
        <template v-if="step.status === 'active'">
          正在搜索「{{ step.query }}」...
        </template>
        <template v-else>
          搜索「{{ step.query }}」找到 {{ step.results }} 条结果
        </template>
      </ChainOfThoughtStep>

      <!-- 思考步骤 -->
      <ChainOfThoughtStep
        v-else-if="step.type === 'thinking'"
        :label="step.label"
        :status="step.status"
        :show-divider="index < steps.length - 1"
      >
        <template #icon>
          <Icon icon="ph:brain" width="14" height="14" />
        </template>
        <IncremarkContent
          v-if="step.content"
          :content="step.content"
          :is-finished="step.status === 'complete'"
        />
        <template v-else>正在分析...</template>
      </ChainOfThoughtStep>

      <!-- 执行步骤 -->
      <ChainOfThoughtStep
        v-else-if="step.type === 'execute'"
        :label="step.label"
        :status="step.status"
        :show-divider="index < steps.length - 1"
      >
        <template #icon>
          <Icon icon="ph:wrench" width="14" height="14" />
        </template>
        <template v-if="step.status === 'active'">正在生成组件代码...</template>
        <template v-else>已生成 ChainOfThought 组件</template>
      </ChainOfThoughtStep>

      <!-- 完成步骤 -->
      <ChainOfThoughtStep
        v-else-if="step.type === 'complete'"
        :label="step.label"
        status="complete"
      >
        <template #icon>
          <Icon icon="ph:check-circle" width="14" height="14" />
        </template>
        已成功创建 ChainOfThought 组件，包含完整的类型定义和样式
      </ChainOfThoughtStep>
    </template>
  </ChainOfThought>
</template>
