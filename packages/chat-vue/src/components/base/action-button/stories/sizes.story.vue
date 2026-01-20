<script setup lang="ts">
/**
 * ActionButton 尺寸展示
 */
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';

const sizes = ['xs', 'sm', 'md', 'lg'] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div
      v-for="size in sizes"
      :key="size"
      style="display: flex; align-items: center; gap: 16px;"
    >
      <div style="width: 60px; color: #666; font-size: 14px;">
        <strong>{{ size }}</strong>
      </div>

      <ActionButton :size="size">
        <SvgIcon>
          <Icon icon="mdi:plus" />
        </SvgIcon>
        Button
      </ActionButton>

      <ActionButton :size="size" square aria-label="仅图标">
        <SvgIcon>
          <Icon icon="mdi:plus" />
        </SvgIcon>
      </ActionButton>

      <ActionButton :size="size" intent="primary">
        <SvgIcon>
          <Icon icon="mdi:check" />
        </SvgIcon>
        Primary
      </ActionButton>
    </div>
  </div>
</template>
