<script setup lang="ts">
import { ImTooltip } from '..';
import { ImButton } from '../../im-button';

const args = {
  content: '这是提示内容',
  placement: 'top' as const
};
</script>

<template>
  <div style="padding: 100px; display: flex; justify-content: center;">
    <ImTooltip v-bind="args">
      <ImButton>悬停显示提示</ImButton>
    </ImTooltip>
  </div>
</template>
