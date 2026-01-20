<script setup lang="ts">
import { ref } from 'vue';
import { MessageActions } from '..';
import { MessageActionFeedback } from '..';
import type { FeedbackValue } from '..';

const feedback = ref<FeedbackValue>('dislike');
</script>

<template>
  <MessageActions>
    <MessageActionFeedback v-model:value="feedback" />
  </MessageActions>
</template>
