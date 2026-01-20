<script setup lang="ts">
import { ImPopover } from '..';
import { ImButton } from '../../im-button';

const args = {
  trigger: 'click' as const,
  placement: 'bottom' as const,
  offset: 8,
  arrow: false,
  disabled: true
};
</script>

<template>
  <div style="padding: 80px; display: flex; justify-content: center;">
    <ImPopover v-bind="args">
      <ImButton>禁用状态</ImButton>
      <template #content>
        <div class="im-popover-content">这不会显示</div>
      </template>
    </ImPopover>
  </div>
</template>
