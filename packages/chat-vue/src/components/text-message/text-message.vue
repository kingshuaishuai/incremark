<script setup lang="ts">
/**
 * TextMessage - 文本消息渲染器
 *
 * 支持 Markdown 和纯文本两种格式
 * 集成 IncremarkContent 实现增量渲染
 */

import { computed } from 'vue';
import { IncremarkContent } from '@incremark/vue';
import { createImBem } from '@incremark/shared';
import type { TextMessageProps } from './types';

const props = withDefaults(defineProps<TextMessageProps>(), {
  streaming: false
});

const bem = createImBem('text-message');

const incremarkOptions = computed(() => ({
  gfm: true,
  htmlTree: true,
  containers: true,
  math: true,
  ...props.incremarkOptions
}));

const isMarkdown = computed(() => props.part.format !== 'plain');
</script>

<template>
  <!-- Markdown 格式 -->
  <IncremarkContent
    v-if="isMarkdown"
    :content="part.content"
    :is-finished="!streaming"
    :incremark-options="incremarkOptions"
    :custom-containers="customContainers"
    :custom-code-blocks="customCodeBlocks"
    :code-block-configs="codeBlockConfigs"
    :pending-class="pendingClass"
  />

  <!-- 纯文本格式 -->
  <div v-else :class="bem('plain')">
    {{ part.content }}
  </div>
</template>
