<script setup lang="ts">
import { ref } from 'vue';
import Sender from '../sender.vue';

const message = ref('');

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  alert(`发送消息: ${msg.content}`);
};
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <Sender
      v-model="message"
      placeholder="输入消息..."
      @submit="handleSubmit"
    />
    <p style="margin-top: 16px; color: #666;">
      当前内容: {{ message || '(空)' }}
    </p>
  </div>
</template>
