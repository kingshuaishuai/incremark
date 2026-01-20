<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考中...',
  loading: true,
  loadingAnimation: 'spin' as const
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <template #loading-icon><Icon icon="ph:spinner" width="14" height="14" /></template>
    <ChainOfThoughtStep status="pending">
      <div>使用旋转动画...</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
