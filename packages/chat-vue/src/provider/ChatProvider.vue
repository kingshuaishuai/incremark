<script setup lang="ts">
/**
 * ChatProvider - 聊天组件全局配置提供者
 *
 * 用于注入 UI 适配器等全局配置
 */

import { provideUIAdapter } from '../composables/useUIAdapter';
import type { ChatProviderProps } from '../types/adapter';

const props = defineProps<ChatProviderProps>();

// 注入 UI 适配器
provideUIAdapter(props.adapter);
</script>

<template>
  <slot />
</template>
