<script setup lang="ts">
/**
 * PartRenderer - Part 类型分发渲染器
 *
 * 根据 Part 类型渲染对应的组件
 * 支持通过 parts prop 注册自定义 Part 组件
 * 支持通过 slot 覆盖特定类型的渲染
 */

import { computed } from 'vue';
import { createImBem } from '@incremark/shared';
import TextMessage from '../text-message/text-message.vue';
import ReasoningMessage from '../reasoning-message/reasoning-message.vue';
import ToolCall from '../tool-call/tool-call.vue';
import type { PartRendererProps } from './types';

const props = withDefaults(defineProps<PartRendererProps>(), {
  streaming: false
});

const bem = createImBem('part-renderer');

// 获取自定义组件
const customComponent = computed(() => {
  return props.parts?.[props.part.type];
});

// 是否为内置类型
const isBuiltinType = computed(() => {
  return ['text', 'reasoning', 'tool-call'].includes(props.part.type);
});
</script>

<template>
  <!-- 优先使用 slot 覆盖 -->
  <slot :name="part.type" :part="part" :streaming="streaming">
    <!-- 自定义组件 -->
    <component
      v-if="customComponent"
      :is="customComponent"
      :part="part"
      :streaming="streaming"
    />

    <!-- TextPart -->
    <TextMessage
      v-else-if="part.type === 'text'"
      :part="part"
      :streaming="streaming"
      :incremark-options="incremarkOptions"
      :custom-containers="customContainers"
      :custom-code-blocks="customCodeBlocks"
      :code-block-configs="codeBlockConfigs"
      :pending-class="pendingClass"
    />

    <!-- ReasoningPart -->
    <ReasoningMessage
      v-else-if="part.type === 'reasoning'"
      :content="part.content"
      :streaming="streaming"
      :incremark-options="incremarkOptions"
      :custom-containers="customContainers"
      :custom-code-blocks="customCodeBlocks"
      :code-block-configs="codeBlockConfigs"
      :pending-class="pendingClass"
    />

    <!-- ToolCallPart -->
    <ToolCall
      v-else-if="part.type === 'tool-call'"
      :part="part"
    />

    <!-- 未知类型 -->
    <div v-else :class="bem('unknown')">
      Unknown Part Type: {{ part.type }}
    </div>
  </slot>
</template>
