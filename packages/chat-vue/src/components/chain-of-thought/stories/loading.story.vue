<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考中...',
  loading: true
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep status="active">
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>正在思考...</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
