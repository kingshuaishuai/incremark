<script setup lang="ts">
import { ImButton } from '..';
import type { ButtonVariant, ButtonColor } from '../types';

const variants: ButtonVariant[] = ['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'];
const colors: ButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'error'];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div v-for="variant in variants" :key="variant" style="display: flex; flex-direction: column; gap: 8px;">
      <div style="font-size: 12px; color: #666; text-transform: capitalize;">{{ variant }}</div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <ImButton v-for="color in colors" :key="color" :variant="variant" :color="color">
          Button
        </ImButton>
      </div>
    </div>
  </div>
</template>
