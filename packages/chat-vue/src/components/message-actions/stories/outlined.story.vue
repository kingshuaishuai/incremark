<script setup lang="ts">
import { ref } from 'vue';
import { MessageActions } from '..';
import { MessageActionCopy } from '..';
import { MessageActionFeedback } from '..';
import type { FeedbackValue } from '..';

const args = {
  variant: 'outlined' as const
};
const feedback = ref<FeedbackValue>('default');
</script>

<template>
  <MessageActions v-bind="args">
    <MessageActionCopy text="Hello, World!" />
    <MessageActionFeedback v-model:value="feedback" />
  </MessageActions>
</template>
