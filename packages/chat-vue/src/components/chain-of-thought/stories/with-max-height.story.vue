<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程',
  maxHeight: 200
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep status="complete" show-divider>
      <template #icon><Icon icon="ph:magnifying-glass" width="14" height="14" /></template>
      <div>搜索相关资料...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="complete" show-divider>
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>分析搜索结果，提取关键信息...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="complete" show-divider>
      <template #icon><Icon icon="ph:wrench" width="14" height="14" /></template>
      <div>调用工具处理数据...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="complete" show-divider>
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>整合结果，生成回答...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="complete">
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>完成思考过程</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
