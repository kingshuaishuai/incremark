<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ImButton } from '..';
import { SvgIcon } from '../../../svg-icon';
import type { ButtonColor } from '../types';

const colors: ButtonColor[] = ['primary', 'neutral', 'success', 'warning', 'error'];
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 16px;">
    <div style="font-size: 12px; color: #666;">Square</div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <ImButton v-for="color in colors" :key="color" :color="color" square>
        <SvgIcon><Icon icon="ph:plus" /></SvgIcon>
      </ImButton>
    </div>
    <div style="font-size: 12px; color: #666;">Circle</div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <ImButton v-for="color in colors" :key="color" :color="color" circle>
        <SvgIcon><Icon icon="ph:plus" /></SvgIcon>
      </ImButton>
    </div>
    <div style="font-size: 12px; color: #666;">Ghost Circle</div>
    <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
      <ImButton v-for="color in colors" :key="color" :color="color" variant="ghost" circle>
        <SvgIcon><Icon icon="ph:plus" /></SvgIcon>
      </ImButton>
    </div>
  </div>
</template>
