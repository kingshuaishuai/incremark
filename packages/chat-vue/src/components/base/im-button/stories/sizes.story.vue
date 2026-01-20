<script setup lang="ts">
import { ImButton } from '..';
import type { ButtonColor, ButtonSize } from '../types';

const sizes: ButtonSize[] = ['xs', 'sm', 'md', 'lg', 'xl'];
const colors: ButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'error'];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div v-for="size in sizes" :key="size" style="display: flex; flex-direction: column; gap: 8px;">
      <div style="font-size: 12px; color: #666;">{{ size }}</div>
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <ImButton v-for="color in colors" :key="color" :size="size" :color="color">
          Button
        </ImButton>
      </div>
    </div>
  </div>
</template>
