<script setup lang="ts">
/**
 * ErrorMessage - 错误消息组件
 */

import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import SvgIcon from '../svg-icon/svg-icon.vue';
import type { ErrorMessageProps, ErrorType } from './types';

const props = withDefaults(defineProps<ErrorMessageProps>(), {
  type: 'unknown',
  retryable: false,
  retryText: '重试'
});

const emit = defineEmits<{
  retry: [];
}>();

const bem = createImBem('error-message');

// 根据错误类型获取图标
const iconMap: Record<ErrorType, string> = {
  'network': 'mdi:wifi-off',
  'rate-limit': 'mdi:clock-alert-outline',
  'server': 'mdi:server-off',
  'auth': 'mdi:account-alert-outline',
  'unknown': 'mdi:alert-circle-outline'
};

const icon = computed(() => iconMap[props.type]);

// 默认标题
const defaultTitleMap: Record<ErrorType, string> = {
  'network': '网络错误',
  'rate-limit': '请求过于频繁',
  'server': '服务器错误',
  'auth': '认证失败',
  'unknown': '出错了'
};

const displayTitle = computed(() => props.title || defaultTitleMap[props.type]);

const handleRetry = () => {
  emit('retry');
};
</script>

<template>
  <div :class="[bem(), bem('', type)]">
    <slot name="icon">
      <SvgIcon :class="bem('icon')">
        <Icon :icon="icon" />
      </SvgIcon>
    </slot>
    <div :class="bem('content')">
      <div :class="bem('title')">{{ displayTitle }}</div>
      <div :class="bem('message')">{{ message }}</div>
    </div>
    <button
      v-if="retryable"
      type="button"
      :class="bem('retry')"
      @click="handleRetry"
    >
      <SvgIcon :class="bem('retry-icon')">
        <Icon icon="mdi:refresh" />
      </SvgIcon>
      {{ retryText }}
    </button>
  </div>
</template>
