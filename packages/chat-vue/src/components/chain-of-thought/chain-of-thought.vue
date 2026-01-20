<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { createImBem } from '@incremark/shared';
import { useChainOfThought } from './composables';
import ChainOfThoughtStep from './chain-of-thought-step.vue';
import { SvgIcon } from '../svg-icon';
import { ReasoningMessage } from '../reasoning-message';
import { TextMessage } from '../text-message';
import type { ChainOfThoughtProps, ComponentRegistry } from './types';

const defaultComponents: ComponentRegistry = {
  reasoning: ReasoningMessage,
  text: TextMessage
};

const props = withDefaults(defineProps<ChainOfThoughtProps>(), {
  title: '思考过程',
  loading: false,
  loadingAnimation: 'pulse',
  locale: 'zh'
});

const expanded = defineModel<boolean>('expanded', { default: true });
const bem = createImBem('cot');
const { duration } = useChainOfThought(props);

const mergedComponents = computed(() => ({
  ...defaultComponents,
  ...props.components
}));

const contentStyle = computed(() => {
  if (!props.maxHeight) return undefined;
  return {
    maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
    overflowY: 'auto' as const
  };
});

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <div :class="bem()">
    <div :class="bem('header')" @click="toggle">
      <SvgIcon v-if="loading" :class="bem('icon', { loading: true, [loadingAnimation]: true })">
        <slot name="loading-icon"><Icon icon="ph:brain" /></slot>
      </SvgIcon>
      <SvgIcon v-else-if="$slots.icon" :class="bem('icon')">
        <slot name="icon" />
      </SvgIcon>
      <div :class="bem('title')">
        {{ title }}
        <span v-if="duration" :class="bem('duration')">{{ duration }}</span>
      </div>
      <SvgIcon :class="bem('chevron', { expanded })">
        <Icon icon="ph:caret-right" />
      </SvgIcon>
    </div>

    <div v-show="expanded" :class="bem('content')" :style="contentStyle">
      <template v-if="steps?.length">
        <ChainOfThoughtStep
          v-for="(step, index) in steps"
          :key="index"
          :label="step.label"
          :status="step.status"
          :show-divider="step.showDivider"
          :collapsible="step.collapsible"
          :default-expanded="step.defaultExpanded"
        >
          <template v-if="step.icon" #icon>
            <component :is="step.icon" />
          </template>
          <component
            v-if="mergedComponents[step.type]"
            :is="mergedComponents[step.type]"
            v-bind="step.data || {}"
          />
          <div v-else>Unknown step type: {{ step.type }}</div>
        </ChainOfThoughtStep>
      </template>
      <slot v-else />
    </div>
  </div>
</template>
