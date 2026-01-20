<script setup lang="ts">
/**
 * ActionButton - 操作按钮 wrapper
 * 统一封装按钮意图，各 adapter 内部转换为具体 props
 */

import { computed } from 'vue';
import { useUIAdapter } from '../../../composables/useUIAdapter';
import type { ActionButtonProps } from './types';

const props = withDefaults(defineProps<ActionButtonProps>(), {
  intent: 'action',
  size: 'sm',
  square: false,
  circle: false,
  disabled: false,
  loading: false,
  active: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const { Button } = useUIAdapter();

/**
 * 将 intent 转换为内置 ImButton 的 props
 * 其他 adapter 可以通过 options prop 获取原始意图
 */
const buttonProps = computed(() => {
  // 意图到样式的映射
  const intentMap: Record<string, { variant: string; color: string }> = {
    action: { variant: 'ghost', color: 'neutral' },
    primary: { variant: 'solid', color: 'primary' },
    secondary: { variant: 'outline', color: 'neutral' },
    danger: { variant: 'solid', color: 'error' },
  };

  const { variant, color } = intentMap[props.intent] || intentMap.action;

  return {
    variant,
    color,
    size: props.size,
    square: props.square,
    circle: props.circle,
    disabled: props.disabled,
    loading: props.loading,
    active: props.active,
    // 传递原始 options，供自定义 adapter 使用
    options: {
      intent: props.intent,
      size: props.size,
      square: props.square,
      circle: props.circle,
      disabled: props.disabled,
      loading: props.loading,
      active: props.active,
    },
  };
});

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <component
    :is="Button"
    v-bind="buttonProps"
    :aria-label="ariaLabel"
    :aria-pressed="props.active"
    @click="handleClick"
  >
    <template #icon>
      <slot name="icon" />
    </template>
    <slot />
  </component>
</template>
