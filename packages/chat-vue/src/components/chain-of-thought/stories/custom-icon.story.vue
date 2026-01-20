<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '已完成'
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <template #icon><Icon icon="ph:check-circle" width="14" height="14" style="color: var(--incremark-base-colors-green-6)" /></template>
    <ChainOfThoughtStep status="complete">
      <div>任务完成</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
