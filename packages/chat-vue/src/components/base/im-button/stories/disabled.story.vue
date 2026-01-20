<script setup lang="ts">
import { ImButton } from '..';
import type { ButtonVariant } from '../types';

const variants: ButtonVariant[] = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'];
</script>

<template>
  <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
    <ImButton v-for="variant in variants" :key="variant" :variant="variant" disabled>
      Disabled
    </ImButton>
  </div>
</template>
