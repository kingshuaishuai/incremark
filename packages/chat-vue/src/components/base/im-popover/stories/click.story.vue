<script setup lang="ts">
import { ImPopover } from '..';
import { ImButton } from '../../im-button';

const args = {
  trigger: 'click' as const,
  placement: 'bottom' as const,
  offset: 8,
  arrow: false,
  disabled: false
};
</script>

<template>
  <div style="padding: 80px; display: flex; justify-content: center;">
    <ImPopover v-bind="args">
      <ImButton>点击显示</ImButton>
      <template #content>
        <div class="im-popover-content">这是弹出内容</div>
      </template>
    </ImPopover>
  </div>
</template>
