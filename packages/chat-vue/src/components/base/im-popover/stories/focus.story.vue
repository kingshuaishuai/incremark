<script setup lang="ts">
import { ImPopover } from '..';

const args = {
  trigger: 'focus' as const,
  placement: 'bottom' as const,
  offset: 8,
  arrow: true,
  disabled: false
};
</script>

<template>
  <div style="padding: 80px; display: flex; justify-content: center;">
    <ImPopover v-bind="args">
      <input type="text" placeholder="聚焦显示弹出层" class="im-demo-input" />
      <template #content>
        <div class="im-popover-content">输入框聚焦时显示</div>
      </template>
    </ImPopover>
  </div>
</template>
