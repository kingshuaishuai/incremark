<script setup lang="ts">
/**
 * 加载状态示例
 * 演示发送中状态下发送按钮变为停止按钮
 */
import { ref } from 'vue';
import Sender from '../sender.vue';

const message = ref('这是一条正在发送的消息');
const loading = ref(true);

const handleSubmit = (msg: { content: string }) => {
  console.log('Submit:', msg);
  loading.value = true;

  // 模拟发送完成
  setTimeout(() => {
    loading.value = false;
  }, 3000);
};

const handleCancel = () => {
  console.log('Cancel');
  loading.value = false;
};

const toggleLoading = () => {
  loading.value = !loading.value;
};
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <Sender
      v-model="message"
      :loading="loading"
      placeholder="输入消息..."
      @submit="handleSubmit"
      @cancel="handleCancel"
    />
    <p style="margin-top: 16px; color: #666;">
      状态: {{ loading ? '发送中...' : '空闲' }}
    </p>
    <button @click="toggleLoading" style="margin-top: 8px;">
      切换 Loading 状态
    </button>
  </div>
</template>
