<script setup lang="ts">
/**
 * SenderAttachments 附件预览示例
 * 展示不同文件类型的图标和颜色
 */
import { ref } from 'vue';
import SenderAttachments from '../components/sender-attachments.vue';
import type { SenderAttachment } from '../types';

const attachments = ref<SenderAttachment[]>([
  // 图片
  {
    id: '1',
    name: 'photo.jpg',
    type: 'image/jpeg',
    size: 1024 * 512,
    url: 'https://picsum.photos/200/150',
  },
  // PDF
  {
    id: '2',
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1024 * 256,
  },
  // Word
  {
    id: '3',
    name: 'report-2024.docx',
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    size: 1024 * 1024,
  },
  // Excel
  {
    id: '4',
    name: 'data.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size: 1024 * 512,
  },
  // PPT
  {
    id: '5',
    name: 'slides.pptx',
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    size: 1024 * 1024 * 5,
  },
  // 压缩包
  {
    id: '6',
    name: 'archive.zip',
    type: 'application/zip',
    size: 1024 * 1024 * 10,
  },
  // 代码
  {
    id: '7',
    name: 'main.ts',
    type: 'text/typescript',
    size: 1024 * 8,
  },
  // 文本
  {
    id: '8',
    name: 'readme.txt',
    type: 'text/plain',
    size: 1024 * 2,
  },
]);

const handleRemove = (id: string) => {
  attachments.value = attachments.value.filter((a) => a.id !== id);
};
</script>

<template>
  <div style="max-width: 700px; margin: 0 auto; padding: 16px; background: var(--incremark-color-background-elevated); border-radius: 8px;">
    <h4 style="margin: 0 0 12px; font-size: 14px; color: var(--incremark-color-text-secondary);">
      附件预览（支持多种文件类型）
    </h4>
    <SenderAttachments
      :attachments="attachments"
      @remove="handleRemove"
    />
    <p style="margin: 12px 0 0; font-size: 12px; color: var(--incremark-color-text-tertiary);">
      不同文件类型显示对应的图标和颜色：PDF（红）、Word（蓝）、Excel（绿）、PPT（橙）、压缩包（黄）、代码（靛青）
    </p>
  </div>
</template>
