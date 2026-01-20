<script setup lang="ts">
/**
 * MessageAction - 通用消息操作按钮
 */

import { computed } from 'vue';
import { createImBem } from '@incremark/shared';
import { useUIAdapter } from '../../composables/useUIAdapter';
import { ActionButton } from '../base/action-button';
import { SvgIcon } from '../svg-icon';
import type { MessageActionProps } from './types';

const props = withDefaults(defineProps<MessageActionProps>(), {
  loading: false,
  disabled: false
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const bem = createImBem('message-action');
const { Tooltip } = useUIAdapter();

const rootClass = computed(() => [
  bem(),
  props.loading && bem('', 'loading'),
  props.disabled && bem('', 'disabled')
]);

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event);
  }
};
</script>

<template>
  <component
    :is="Tooltip"
    :content="tooltip"
  >
    <ActionButton
      :class="rootClass"
      intent="action"
      size="sm"
      square
      :disabled="disabled"
      :loading="loading"
      :aria-label="label || tooltip"
      @click="handleClick"
    >
      <slot>
        <SvgIcon v-if="icon" :class="bem('icon')">
          <component :is="icon" />
        </SvgIcon>
      </slot>
    </ActionButton>
  </component>
</template>
