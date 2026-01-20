<script setup lang="ts">
/**
 * ActionButton 仅图标按钮
 * 展示 square 和 circle 属性
 */
import { Icon } from '@iconify/vue';
import ActionButton from '../action-button.vue';
import SvgIcon from '../../../svg-icon/svg-icon.vue';
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 24px;">
    <!-- Square 按钮 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">Square（正方形）</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton square aria-label="添加">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square aria-label="复制">
          <SvgIcon>
            <Icon icon="mdi:content-copy" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square aria-label="刷新">
          <SvgIcon>
            <Icon icon="mdi:refresh" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square intent="danger" aria-label="删除">
          <SvgIcon>
            <Icon icon="mdi:delete" />
          </SvgIcon>
        </ActionButton>
      </div>
    </div>

    <!-- Circle 按钮 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">Circle（圆形）</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton circle aria-label="添加">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton circle aria-label="复制">
          <SvgIcon>
            <Icon icon="mdi:content-copy" />
          </SvgIcon>
        </ActionButton>
        <ActionButton circle aria-label="刷新">
          <SvgIcon>
            <Icon icon="mdi:refresh" />
          </SvgIcon>
        </ActionButton>
        <ActionButton circle intent="primary" aria-label="确认">
          <SvgIcon>
            <Icon icon="mdi:check" />
          </SvgIcon>
        </ActionButton>
      </div>
    </div>

    <!-- 不同尺寸的图标按钮 -->
    <div>
      <h4 style="margin: 0 0 12px; color: #333;">不同尺寸</h4>
      <div style="display: flex; gap: 12px; align-items: center;">
        <ActionButton square size="xs" aria-label="xs">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square size="sm" aria-label="sm">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square size="md" aria-label="md">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
        <ActionButton square size="lg" aria-label="lg">
          <SvgIcon>
            <Icon icon="mdi:plus" />
          </SvgIcon>
        </ActionButton>
      </div>
    </div>
  </div>
</template>
