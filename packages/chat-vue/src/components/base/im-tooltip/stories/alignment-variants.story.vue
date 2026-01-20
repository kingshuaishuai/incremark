<script setup lang="ts">
import { ImTooltip } from '..';
import { ImButton } from '../../im-button';
</script>

<template>
  <div style="padding: 100px; display: flex; flex-direction: column; gap: 32px; align-items: center;">
    <div style="display: flex; gap: 16px;">
      <ImTooltip content="top-start" placement="top-start">
        <ImButton>top-start</ImButton>
      </ImTooltip>
      <ImTooltip content="top" placement="top">
        <ImButton>top</ImButton>
      </ImTooltip>
      <ImTooltip content="top-end" placement="top-end">
        <ImButton>top-end</ImButton>
      </ImTooltip>
    </div>
    <div style="display: flex; gap: 16px;">
      <ImTooltip content="bottom-start" placement="bottom-start">
        <ImButton>bottom-start</ImButton>
      </ImTooltip>
      <ImTooltip content="bottom" placement="bottom">
        <ImButton>bottom</ImButton>
      </ImTooltip>
      <ImTooltip content="bottom-end" placement="bottom-end">
        <ImButton>bottom-end</ImButton>
      </ImTooltip>
    </div>
  </div>
</template>
