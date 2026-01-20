<script setup lang="ts">
/**
 * ActionButton 加载状态
 */
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';

const loading = ref(false);

const handleClick = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
  }, 2000);
};
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">加载状态</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton loading>
          <template #icon>
            <SvgIcon>
              <Icon icon="mdi:plus" />
            </SvgIcon>
          </template>
          Action
        </ActionButton>
        <ActionButton loading intent="primary">
          <template #icon>
            <SvgIcon>
              <Icon icon="mdi:check" />
            </SvgIcon>
          </template>
          Primary
        </ActionButton>
        <ActionButton loading intent="danger">
          <template #icon>
            <SvgIcon>
              <Icon icon="mdi:delete" />
            </SvgIcon>
          </template>
          Danger
        </ActionButton>
      </div>
    </div>

    <div>
      <h4 style="margin: 0 0 12px; color: #333;">加载的图标按钮</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton loading square aria-label="添加">
          <template #icon>
            <SvgIcon>
              <Icon icon="mdi:plus" />
            </SvgIcon>
          </template>
        </ActionButton>
        <ActionButton loading circle intent="primary" aria-label="确认">
          <template #icon>
            <SvgIcon>
              <Icon icon="mdi:check" />
            </SvgIcon>
          </template>
        </ActionButton>
      </div>
    </div>

    <div>
      <h4 style="margin: 0 0 12px; color: #333;">交互演示</h4>
      <p style="margin: 0 0 12px; color: #666; font-size: 14px;">点击按钮触发 2 秒加载状态</p>
      <ActionButton :loading="loading" intent="primary" @click="handleClick">
        <template #icon>
          <SvgIcon>
            <Icon icon="mdi:send" />
          </SvgIcon>
        </template>
        {{ loading ? '发送中...' : '发送' }}
      </ActionButton>
    </div>
  </div>
</template>
