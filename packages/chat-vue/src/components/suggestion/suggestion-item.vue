<script setup lang="ts">
/**
 * SuggestionItem - 单个建议项组件
 */

import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import SvgIcon from '../svg-icon/svg-icon.vue';
import type { SuggestionItem } from './types';

const props = defineProps<{
  item: SuggestionItem;
}>();

const emit = defineEmits<{
  click: [item: SuggestionItem];
}>();

const bem = createImBem('suggestion-item');

const handleClick = () => {
  if (!props.item.disabled) {
    emit('click', props.item);
  }
};
</script>

<template>
  <button
    type="button"
    :class="[bem(), { [bem('', 'disabled')]: item.disabled }]"
    :disabled="item.disabled"
    @click="handleClick"
  >
    <slot name="icon">
      <SvgIcon v-if="item.icon" :class="bem('icon')">
        <Icon :icon="item.icon" />
      </SvgIcon>
    </slot>
    <span :class="bem('content')">
      <span :class="bem('label')">{{ item.label }}</span>
      <span v-if="item.description" :class="bem('description')">{{ item.description }}</span>
    </span>
  </button>
</template>
