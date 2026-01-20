<script setup lang="ts">
import { ref } from 'vue';
import { MessageActions } from '..';
import type { FeedbackValue, ActionItem } from '..';

const feedback = ref<FeedbackValue>('default');
const actions: ActionItem[] = [
  {
    key: 'copy',
    type: 'copy',
    copyText: 'Hello, World!',
    tooltip: '复制'
  },
  {
    key: 'feedback',
    type: 'feedback'
  }
];
const handleAction = (item: ActionItem) => {
  console.log('Action:', item.key);
};
</script>

<template>
  <MessageActions
    :actions="actions"
    v-model:feedback-value="feedback"
    @action="handleAction"
  />
</template>
