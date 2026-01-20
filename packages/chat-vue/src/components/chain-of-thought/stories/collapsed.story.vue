<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { ChainOfThought, ChainOfThoughtStep } from '../index';

const args = {
  title: '思考过程'
};
const expanded = ref(false);
</script>

<template>
  <ChainOfThought v-bind="args" v-model:expanded="expanded">
    <ChainOfThoughtStep status="complete">
      <template #icon><Icon icon="ph:brain" width="14" height="14" /></template>
      <div>点击标题展开查看内容</div>
    </ChainOfThoughtStep>
  </ChainOfThought>
</template>
