<script setup lang="ts">
/**
 * Suggestion - 快捷建议组件
 */

import { createImBem } from '@incremark/shared';
import SuggestionItemVue from './suggestion-item.vue';
import type { SuggestionProps, SuggestionItem } from './types';

withDefaults(defineProps<SuggestionProps>(), {
  vertical: false
});

const emit = defineEmits<{
  select: [item: SuggestionItem];
}>();

const bem = createImBem('suggestion');

const handleItemClick = (item: SuggestionItem) => {
  emit('select', item);
};
</script>

<template>
  <div :class="[bem(), { [bem('', 'vertical')]: vertical }]">
    <SuggestionItemVue
      v-for="(item, index) in items"
      :key="item.id ?? index"
      :item="item"
      @click="handleItemClick"
    >
      <template #icon>
        <slot name="icon" :item="item" />
      </template>
    </SuggestionItemVue>
  </div>
</template>
