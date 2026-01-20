<script setup lang="ts">
/**
 * ActionButton 默认示例
 */
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';
</script>

<template>
  <div style="display: flex; gap: 16px; align-items: center;">
    <ActionButton>
      <SvgIcon>
        <Icon icon="mdi:plus" />
      </SvgIcon>
      添加
    </ActionButton>

    <ActionButton intent="primary">
      <SvgIcon>
        <Icon icon="mdi:check" />
      </SvgIcon>
      确认
    </ActionButton>

    <ActionButton intent="danger">
      <SvgIcon>
        <Icon icon="mdi:delete" />
      </SvgIcon>
      删除
    </ActionButton>
  </div>
</template>
