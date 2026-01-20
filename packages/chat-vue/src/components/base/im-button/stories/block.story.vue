<script setup lang="ts">
import { ImButton } from '..';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 12px; max-width: 400px;">
    <ImButton block>Block Button</ImButton>
    <ImButton block variant="outline">Block Outline</ImButton>
    <ImButton block variant="soft">Block Soft</ImButton>
  </div>
</template>
