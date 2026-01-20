<script setup lang="ts">
/**
 * ImButton - 按钮组件
 *
 * 支持 6 种变体: solid, outline, soft, subtle, ghost, link
 * 支持 5 种颜色: primary, neutral, success, warning, error
 * 支持 5 种尺寸: xs, sm, md, lg, xl
 */

import { computed } from 'vue';
import { createImBem } from '@incremark/shared';
import type { ImButtonProps } from './types';

const props = withDefaults(defineProps<ImButtonProps>(), {
  variant: 'solid',
  color: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  block: false,
  square: false,
  circle: false,
  active: false
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const bem = createImBem('button');

const rootClass = computed(() => [
  bem(),
  bem('', props.variant),
  bem('', props.color),
  bem('', props.size),
  props.block && bem('', 'block'),
  props.square && bem('', 'square'),
  props.circle && bem('', 'circle'),
  props.loading && bem('', 'loading'),
  props.disabled && bem('', 'disabled'),
  props.active && bem('', 'active')
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <button
    :class="rootClass"
    :disabled="disabled || loading"
    type="button"
    @click="handleClick"
  >
    <span v-if="loading" :class="bem('spinner')" />
    <slot v-else name="icon" />
    <slot />
  </button>
</template>
