<script setup lang="ts">
import { ImPopover } from '..';
import { ImButton } from '../../im-button';

const args = {
  trigger: 'click' as const,
  placement: 'top' as const,
  offset: 8,
  arrow: true,
  disabled: false
};
</script>

<template>
  <div style="padding: 80px; display: flex; justify-content: center;">
    <ImPopover v-bind="args">
      <ImButton>带箭头</ImButton>
      <template #content>
        <div class="im-popover-content">带箭头的弹出层</div>
      </template>
    </ImPopover>
  </div>
</template>
