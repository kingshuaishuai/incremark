<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程'
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep status="complete" show-divider>
      <template #icon><Icon icon="ph:magnifying-glass" width="14" height="14" /></template>
      <div>搜索相关资料...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="active" show-divider>
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>正在分析结果...</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="pending">
      <template #icon><Icon icon="ph:wrench" width="14" height="14" /></template>
      <div>等待执行...</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
