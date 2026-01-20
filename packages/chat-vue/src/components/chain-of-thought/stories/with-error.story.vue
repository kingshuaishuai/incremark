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
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>第一步完成</div>
    </ChainOfThoughtStep>
    <ChainOfThoughtStep status="error">
      <template #icon><Icon icon="ph:wrench" width="14" height="14" /></template>
      <div style="color: var(--incremark-base-colors-red-6)">工具调用失败</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
