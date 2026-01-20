<script setup lang="ts">
import { ImPopover } from '..';
import { ImButton } from '../../im-button';
</script>

<template>
  <div style="padding: 80px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: center;">
    <ImPopover placement="top" arrow>
      <ImButton>Top</ImButton>
      <template #content>
        <div class="im-popover-content">Top</div>
      </template>
    </ImPopover>
    <ImPopover placement="bottom" arrow>
      <ImButton>Bottom</ImButton>
      <template #content>
        <div class="im-popover-content">Bottom</div>
      </template>
    </ImPopover>
    <ImPopover placement="left" arrow>
      <ImButton>Left</ImButton>
      <template #content>
        <div class="im-popover-content">Left</div>
      </template>
    </ImPopover>
    <ImPopover placement="right" arrow>
      <ImButton>Right</ImButton>
      <template #content>
        <div class="im-popover-content">Right</div>
      </template>
    </ImPopover>
  </div>
</template>
