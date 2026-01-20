<script setup lang="ts">
import { createImBem } from '@incremark/shared';

const bem = createImBem('svg-icon');
</script>

<template>
  <span :class="bem()">
    <slot />
  </span>
</template>
