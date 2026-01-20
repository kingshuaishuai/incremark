<script setup lang="ts">
/**
 * SenderActionButton - Sender 工具栏操作按钮
 * 用于附件、语音、模式切换等操作
 */

import { createImBem } from '@incremark/shared';
import ActionButton from '../../base/action-button/action-button.vue';
import type { SenderActionButtonProps } from '../types';

const props = withDefaults(defineProps<SenderActionButtonProps>(), {
  disabled: false,
  active: false,
  square: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const bem = createImBem('sender-action-button');

const handleClick = (event: MouseEvent) => {
  if (!props.disabled) {
    emit('click', event);
  }
};
</script>

<template>
  <ActionButton
    :class="[bem('', { active: props.active })]"
    intent="action"
    size="sm"
    :square="props.square"
    :disabled="props.disabled"
    :aria-label="props.ariaLabel"
    @click="handleClick"
  >
    <template #icon>
      <slot name="icon" />
    </template>
    <slot />
  </ActionButton>
</template>
