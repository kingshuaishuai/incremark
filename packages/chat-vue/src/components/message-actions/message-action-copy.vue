<script setup lang="ts">
/**
 * MessageActionCopy - 复制操作按钮
 */

import { computed, toRef, h } from 'vue';
import { Icon } from '@iconify/vue';
import { useUIAdapter } from '../../composables/useUIAdapter';
import { useCopyAction } from './composables/useCopyAction';
import MessageAction from './message-action.vue';
import type { MessageActionCopyProps } from './types';

const props = withDefaults(defineProps<MessageActionCopyProps>(), {
  tooltip: '复制',
  copiedTooltip: '已复制'
});

const { icons } = useUIAdapter();
const { copied, copy } = useCopyAction(toRef(props, 'text'));

// 默认图标使用 Phosphor
const defaultCopyIcon = h(Icon, { icon: 'ph:copy' });
const defaultCheckIcon = h(Icon, { icon: 'ph:check' });

const currentIcon = computed(() => {
  if (copied.value) {
    return icons?.check || defaultCheckIcon;
  }
  return icons?.copy || defaultCopyIcon;
});

const currentTooltip = computed(() => {
  return copied.value ? props.copiedTooltip : props.tooltip;
});
</script>

<template>
  <MessageAction
    :icon="currentIcon"
    :tooltip="currentTooltip"
    :label="currentTooltip"
    @click="copy"
  />
</template>
