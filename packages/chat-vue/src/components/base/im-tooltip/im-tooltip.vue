<script setup lang="ts">
/**
 * ImTooltip - 提示组件
 * 基于 ImPopover 实现，hover 触发，深色背景
 */

import { createImBem } from '@incremark/shared';
import { ImPopover } from '../im-popover';
import type { ImTooltipProps } from './types';

const props = withDefaults(defineProps<ImTooltipProps>(), {
  placement: 'top',
  to: 'body',
  teleportDisabled: false
});

const bem = createImBem('tooltip');
</script>

<template>
  <ImPopover
    v-if="content"
    trigger="hover"
    :placement="placement"
    :offset="8"
    :arrow="true"
    :to="to"
    :teleport-disabled="teleportDisabled"
  >
    <slot />
    <template #content>
      <div :class="bem()">
        {{ content }}
      </div>
    </template>
  </ImPopover>
  <slot v-else />
</template>
