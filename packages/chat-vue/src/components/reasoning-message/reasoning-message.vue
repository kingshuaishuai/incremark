<script setup lang="ts">
/**
 * ReasoningMessage - 推理内容渲染器
 *
 * 只负责渲染推理内容（Markdown），不包含折叠逻辑
 * 折叠功能请使用 ChainOfThought 组件包裹
 */

import { computed } from 'vue';
import { IncremarkContent } from '@incremark/vue';
import { createImBem } from '@incremark/shared';
import type { ReasoningMessageProps } from './types';

const props = withDefaults(defineProps<ReasoningMessageProps>(), {
  streaming: false,
  plainText: false,
  blockquote: false
});

const bem = createImBem('reasoning');

const incremarkOptions = computed(() => ({
  gfm: true,
  htmlTree: true,
  containers: true,
  math: true,
  ...props.incremarkOptions
}));
</script>

<template>
  <div :class="bem(undefined, { blockquote })">
    <template v-if="plainText">{{ content }}</template>
    <IncremarkContent
      v-else
      :content="content"
      :is-finished="!streaming"
      :incremark-options="incremarkOptions"
      :custom-containers="customContainers"
      :custom-code-blocks="customCodeBlocks"
      :code-block-configs="codeBlockConfigs"
      :pending-class="pendingClass"
    />
  </div>
</template>
