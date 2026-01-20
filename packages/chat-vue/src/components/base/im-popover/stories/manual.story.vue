<script setup lang="ts">
import { ref } from 'vue';
import { ImPopover } from '..';
import { ImButton } from '../../im-button';

const visible = ref(false);
const toggle = () => {
  visible.value = !visible.value;
};
</script>

<template>
  <div style="padding: 80px; display: flex; flex-direction: column; align-items: center; gap: 12px;">
    <ImButton @click="toggle">{{ visible ? '隐藏' : '显示' }} Popover</ImButton>
    <ImPopover v-model:visible="visible" trigger="manual" placement="bottom" arrow>
      <span class="im-demo-trigger">触发区域</span>
      <template #content>
        <div class="im-popover-content">手动控制的弹出层</div>
      </template>
    </ImPopover>
  </div>
</template>
