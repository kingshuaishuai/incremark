<script setup lang="ts">
/**
 * 带文件上传的 Sender 示例
 * 演示如何使用 SenderFileButton 和 SenderAttachments 实现文件上传功能
 */
import { ref } from 'vue';
import Sender from '../sender.vue';
import SenderFileButton from '../components/sender-file-button.vue';
import SenderAttachments from '../components/sender-attachments.vue';
import type { SenderAttachment, SenderMessage } from '../types';

const message = ref('');
const attachments = ref<SenderAttachment[]>([]);

const handleSubmit = (msg: SenderMessage) => {
  console.log('Submit:', msg);
  // 清空附件
  attachments.value = [];
};

const handleRemove = (id: string) => {
  attachments.value = attachments.value.filter((a) => a.id !== id);
};
</script>

<template>
  <div style="max-width: 600px; margin: 0 auto;">
    <Sender
      v-model="message"
      v-model:attachments="attachments"
      placeholder="输入消息，或上传文件..."
      accept="image/*,.pdf,.doc,.docx"
      :max-files="5"
      :max-size="10 * 1024 * 1024"
      @submit="handleSubmit"
    >
      <template #attachments>
        <SenderAttachments
          :attachments="attachments"
          @remove="handleRemove"
        />
      </template>
      <template #prefix>
        <SenderFileButton />
      </template>
    </Sender>
  </div>
</template>
