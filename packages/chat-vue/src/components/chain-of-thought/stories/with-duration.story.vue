<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程',
  startTime: Date.now() - 5432,
  endTime: Date.now()
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep status="complete">
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>完成思考，耗时约 5 秒</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
