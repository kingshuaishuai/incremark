<script setup lang="ts">
/**
 * SenderSubmitButton - 发送/停止按钮
 * loading 状态下显示停止图标，点击触发 cancel
 */

import { computed } from 'vue';
import { createImBem } from '@incremark/shared';
import { Icon } from '@iconify/vue';
import ImButton from '../../base/im-button/im-button.vue';
import SvgIcon from '../../svg-icon/svg-icon.vue';
import type { SenderSubmitButtonProps } from '../types';

const props = withDefaults(defineProps<SenderSubmitButtonProps>(), {
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const bem = createImBem('sender-submit-button');

// loading 时按钮可点击（用于取消），使用 neutral 色
// 非 loading 时使用 primary 色
const buttonColor = computed(() => props.loading ? 'neutral' : 'primary');

// loading 时不禁用按钮（需要能点击取消）
const isDisabled = computed(() => props.disabled && !props.loading);

const handleClick = (event: MouseEvent) => {
  if (!props.loading && props.disabled) {
    return;
  }
  emit('click', event);
};
</script>

<template>
  <ImButton
    :class="bem('', { loading: props.loading })"
    variant="solid"
    :color="buttonColor"
    size="sm"
    square
    :disabled="isDisabled"
    :aria-label="props.loading ? '停止' : '发送'"
    @click="handleClick"
  >
    <slot>
      <SvgIcon :class="bem('icon')">
        <Icon :icon="props.loading ? 'mdi:stop' : 'mdi:arrow-up'" />
      </SvgIcon>
    </slot>
  </ImButton>
</template>
