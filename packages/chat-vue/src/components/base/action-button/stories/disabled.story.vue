<script setup lang="ts">
/**
 * ActionButton 禁用状态
 */
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">禁用状态</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton disabled>
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
          Action
        </ActionButton>
        <ActionButton disabled intent="primary">
          <SvgIcon>
            <Icon icon="mdi:check" />
          </SvgIcon>
          Primary
        </ActionButton>
        <ActionButton disabled intent="secondary">
          <SvgIcon>
            <Icon icon="mdi:information" />
          </SvgIcon>
          Secondary
        </ActionButton>
        <ActionButton disabled intent="danger">
          <SvgIcon>
            <Icon icon="mdi:delete" />
          </SvgIcon>
          Danger
        </ActionButton>
      </div>
    </div>

    <div>
      <h4 style="margin: 0 0 12px; color: #333;">禁用的图标按钮</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton disabled square aria-label="添加">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton disabled square intent="primary" aria-label="确认">
          <SvgIcon>
            <Icon icon="mdi:check" />
          </SvgIcon>
        </ActionButton>
        <ActionButton disabled circle aria-label="刷新">
          <SvgIcon>
            <Icon icon="mdi:refresh" />
          </SvgIcon>
        </ActionButton>
      </div>
    </div>
  </div>
</template>
