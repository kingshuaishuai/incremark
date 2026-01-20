<script setup lang="ts">
/**
 * Welcome - 欢迎页组件
 */

import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import SvgIcon from '../svg-icon/svg-icon.vue';
import { Suggestion } from '../suggestion';
import type { SuggestionItem } from '../suggestion/types';
import type { WelcomeProps } from './types';

withDefaults(defineProps<WelcomeProps>(), {
  title: '你好，有什么可以帮你？',
  icon: 'mdi:robot-happy-outline'
});

const emit = defineEmits<{
  select: [item: SuggestionItem];
}>();

const bem = createImBem('welcome');

const handleSelect = (item: SuggestionItem) => {
  emit('select', item);
};
</script>

<template>
  <div :class="bem()">
    <div :class="bem('header')">
      <slot name="icon">
        <SvgIcon v-if="icon" :class="bem('icon')">
          <Icon :icon="icon" />
        </SvgIcon>
      </slot>
      <h2 :class="bem('title')">{{ title }}</h2>
      <p v-if="description" :class="bem('description')">{{ description }}</p>
    </div>

    <div v-if="suggestions?.length" :class="bem('suggestions')">
      <slot name="suggestions" :items="suggestions">
        <Suggestion :items="suggestions" @select="handleSelect" />
      </slot>
    </div>

    <div v-if="hint || $slots.hint" :class="bem('hint')">
      <slot name="hint">{{ hint }}</slot>
    </div>
  </div>
</template>
