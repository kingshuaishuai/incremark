<script setup lang="ts">
/**
 * ChainOfThoughtStep - 步骤组件
 *
 * 结构：图标 + 内容区（header/body/footer）
 * 根据状态显示默认图标，也支持自定义图标
 */

import { computed, useSlots } from 'vue';
import { createImBem } from '@incremark/shared';
import { Icon } from '@iconify/vue';
import { useCollapsible } from '../../composables';
import { SvgIcon } from '../svg-icon';
import type { ChainOfThoughtStepProps } from './types';

const props = withDefaults(defineProps<ChainOfThoughtStepProps>(), {
  status: 'pending',
  showDivider: false,
  collapsible: false,
  defaultExpanded: true
});

const slots = useSlots();
const bem = createImBem('cot-step');

const { expanded, toggle: baseToggle } = useCollapsible(props.defaultExpanded);
const toggle = () => {
  if (props.collapsible) baseToggle();
};

const hasHeader = computed(() => !!props.label || !!slots.header);
const hasFooter = computed(() => !!slots.footer);
</script>

<template>
  <div :class="bem(undefined, { [status]: true, collapsible, collapsed: collapsible && !expanded })">
    <!-- 图标位置 -->
    <SvgIcon :class="bem('icon', { 'with-divider': showDivider })">
      <slot name="icon">
        <!-- 默认图标 -->
        <Icon v-if="status === 'pending'" icon="ph:circle" />
        <Icon v-else-if="status === 'active'" icon="ph:spinner" :class="bem('spinner')" />
        <Icon v-else-if="status === 'complete'" icon="ph:check-circle" />
        <Icon v-else-if="status === 'error'" icon="ph:x-circle" />
      </slot>
    </SvgIcon>

    <!-- 内容区域 -->
    <div :class="bem('content')">
      <!-- Header: label prop 或 header slot -->
      <div v-if="hasHeader" :class="bem('header')" @click="toggle">
        <slot name="header">{{ label }}</slot>
        <SvgIcon v-if="collapsible" :class="bem('chevron')">
          <Icon icon="ph:caret-right" />
        </SvgIcon>
      </div>

      <!-- Body: 默认 slot -->
      <div v-if="$slots.default && (!collapsible || expanded)" :class="bem('body')">
        <slot />
      </div>

      <!-- Footer: footer slot -->
      <div v-if="hasFooter && (!collapsible || expanded)" :class="bem('footer')">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
