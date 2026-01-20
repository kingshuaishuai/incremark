<script setup lang="ts">
import { ImPopover } from '..';
import { ImButton } from '../../im-button';

const args = {
  trigger: 'hover' as const,
  placement: 'top' as const,
  offset: 8,
  arrow: true,
  disabled: false
};
</script>

<template>
  <div style="padding: 80px; display: flex; justify-content: center;">
    <ImPopover v-bind="args">
      <ImButton>悬停显示</ImButton>
      <template #content>
        <div class="im-popover-content">鼠标悬停时显示</div>
      </template>
    </ImPopover>
  </div>
</template>
