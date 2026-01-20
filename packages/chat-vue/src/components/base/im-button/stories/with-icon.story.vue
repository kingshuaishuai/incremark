<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ImButton } from '..';
import { SvgIcon } from '../../../svg-icon';
import type { ButtonColor } from '../types';

const colors: ButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'error'];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <ImButton v-for="color in colors" :key="color" :color="color">
        <SvgIcon><Icon icon="ph:rocket" /></SvgIcon>
        Button
      </ImButton>
    </div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <ImButton v-for="color in colors" :key="color" :color="color" variant="outline">
        Button
        <SvgIcon><Icon icon="ph:arrow-right" /></SvgIcon>
      </ImButton>
    </div>
  </div>
</template>
