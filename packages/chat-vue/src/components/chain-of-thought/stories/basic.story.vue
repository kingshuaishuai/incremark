<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程'
};
</script>

<template>
  <ChainOfThought v-bind="args">
    <ChainOfThoughtStep status="complete">
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>分析用户问题并理解需求...</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
