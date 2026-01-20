<script setup lang="ts">
import { ref } from 'vue';
import { MessageActions } from '..';
import { MessageActionFeedback } from '..';
import type { FeedbackValue } from '..';

const feedback = ref<FeedbackValue>('default');
</script>

<template>
  <div>
    <MessageActions>
      <MessageActionFeedback
        v-model:value="feedback"
        like-tooltip="这个回答有帮助"
        dislike-tooltip="这个回答没帮助"
      />
    </MessageActions>
    <p style="margin-top: 8px; color: #666;">当前状态: {{ feedback }}</p>
  </div>
</template>
