<script setup lang="ts">
/**
 * SenderAttachments - 附件预览列表
 *
 * 使用 FilePreview 组件渲染附件，支持不同文件类型的图标和颜色
 */

import { createImBem } from '@incremark/shared';
import { FilePreview } from '../../file-preview';
import type { SenderAttachment } from '../types';

defineProps<{
  attachments: SenderAttachment[];
}>();

const emit = defineEmits<{
  remove: [id: string];
}>();

const bem = createImBem('sender-attachments');

const handleRemove = (id: string) => {
  emit('remove', id);
};
</script>

<template>
  <div v-if="attachments.length > 0" :class="bem()">
    <FilePreview
      v-for="attachment in attachments"
      :key="attachment.id"
      :file="{
        name: attachment.name,
        type: attachment.type,
        size: attachment.size,
        url: attachment.url,
      }"
      compact
      removable
      @remove="handleRemove(attachment.id)"
    />
  </div>
</template>
