<script setup lang="ts">
/**
 * MessageBubble - 消息气泡容器
 *
 * 用于包裹各种消息内容（TextMessage、ToolCall 等）
 * 提供 avatar、header、footer 插槽供用户自定义
 */

import { computed } from 'vue'
import { createImBem } from '@incremark/shared'
import type { MessageBubbleProps } from './types'

const props = withDefaults(defineProps<MessageBubbleProps>(), {
  placement: 'start',
  variant: 'filled',
  shape: 'default',
  width: 'block',
  loading: false,
  streaming: false
})

const bem = createImBem('message-bubble')

const rootClass = computed(() => [
  bem(),
  bem('', props.placement),
  bem('', props.width),
  props.loading && bem('', 'loading'),
  props.streaming && bem('', 'streaming')
])

const contentClass = computed(() => [
  bem('content'),
  bem('content', props.variant),
  bem('content', props.shape)
])
</script>

<template>
  <div :class="rootClass">
    <!-- 头像插槽 -->
    <div v-if="$slots.avatar" :class="bem('avatar')">
      <slot name="avatar" />
    </div>

    <!-- 主体区域 -->
    <div :class="bem('main')">
      <!-- 头部插槽 -->
      <div v-if="$slots.header" :class="bem('header')">
        <slot name="header" />
      </div>

      <!-- 内容区域 -->
      <div :class="contentClass">
        <slot />
      </div>

      <!-- 底部插槽 -->
      <div v-if="$slots.footer" :class="bem('footer')">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
