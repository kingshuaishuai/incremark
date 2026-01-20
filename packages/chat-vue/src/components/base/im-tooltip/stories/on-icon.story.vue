<script setup lang="ts">
import { ImTooltip } from '..';
</script>

<template>
  <div style="padding: 100px; display: flex; gap: 24px; justify-content: center;">
    <ImTooltip content="复制" placement="top">
      <span style="cursor: pointer; font-size: 20px;">📋</span>
    </ImTooltip>
    <ImTooltip content="编辑" placement="top">
      <span style="cursor: pointer; font-size: 20px;">✏️</span>
    </ImTooltip>
    <ImTooltip content="删除" placement="top">
      <span style="cursor: pointer; font-size: 20px;">🗑️</span>
    </ImTooltip>
  </div>
</template>
