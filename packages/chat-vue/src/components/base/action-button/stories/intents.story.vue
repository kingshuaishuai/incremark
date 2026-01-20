<script setup lang="ts">
/**
 * ActionButton 意图展示
 * 展示不同 intent 的按钮样式
 */
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';

const intents = [
  { value: 'action', label: 'Action', description: '操作按钮（默认）', icon: 'mdi:cursor-default-click' },
  { value: 'primary', label: 'Primary', description: '主要操作', icon: 'mdi:check' },
  { value: 'secondary', label: 'Secondary', description: '次要操作', icon: 'mdi:information' },
  { value: 'danger', label: 'Danger', description: '危险操作', icon: 'mdi:delete' },
] as const;
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div
      v-for="intent in intents"
      :key="intent.value"
      style="display: flex; align-items: center; gap: 16px;"
    >
      <div style="width: 120px; color: #666; font-size: 14px;">
        <strong>{{ intent.label }}</strong>
        <div style="font-size: 12px; color: #999;">{{ intent.description }}</div>
      </div>

      <ActionButton :intent="intent.value">
        <SvgIcon>
          <Icon :icon="intent.icon" />
        </SvgIcon>
        {{ intent.label }}
      </ActionButton>

      <ActionButton :intent="intent.value" square aria-label="仅图标">
        <SvgIcon>
          <Icon :icon="intent.icon" />
        </SvgIcon>
      </ActionButton>
    </div>
  </div>
</template>
