<script setup lang="ts">
import { ImTooltip } from '..';
import { ImButton } from '../../im-button';

const args = {
  content: '这是一段比较长的提示文本，用于测试 Tooltip 组件对长文本的处理效果。',
  placement: 'top' as const
};
</script>

<template>
  <div style="padding: 100px; display: flex; justify-content: center;">
    <ImTooltip v-bind="args">
      <ImButton>长文本提示</ImButton>
    </ImTooltip>
  </div>
</template>
