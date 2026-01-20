<script setup lang="ts">
import PartRenderer from '..';
import type { TextPart } from '@incremark/chat-core';

const args = {
  part: {
    type: 'text',
    content: '这段文本使用 slot 自定义渲染',
    format: 'plain'
  } as TextPart
};
</script>

<template>
  <PartRenderer v-bind="args">
    <template #text="{ part }">
      <div style="padding: 12px; background: #fef3c7; border-radius: 8px;">
        <strong>自定义文本渲染：</strong>
        {{ part.content }}
      </div>
    </template>
  </PartRenderer>
</template>
