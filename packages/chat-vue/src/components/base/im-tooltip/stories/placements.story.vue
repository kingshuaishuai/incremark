<script setup lang="ts">
import { ImTooltip } from '..';
import { ImButton } from '../../im-button';
</script>

<template>
  <div style="padding: 100px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center;">
    <ImTooltip content="Top 位置" placement="top">
      <ImButton>Top</ImButton>
    </ImTooltip>
    <ImTooltip content="Bottom 位置" placement="bottom">
      <ImButton>Bottom</ImButton>
    </ImTooltip>
    <ImTooltip content="Left 位置" placement="left">
      <ImButton>Left</ImButton>
    </ImTooltip>
    <ImTooltip content="Right 位置" placement="right">
      <ImButton>Right</ImButton>
    </ImTooltip>
  </div>
</template>
